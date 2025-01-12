#!/usr/bin/env node

var amqp = require("amqplib/callback_api");
var { runScraper } = require("./scraper");
amqp.connect("amqp://localhost", function (error0, connection) {
  if (error0) {
    throw error0;
  }
  connection.createChannel(function (error1, channel) {
    if (error1) {
      throw error1;
    }
    var queue = "scraper_queue";

    // This makes sure the queue is declared before attempting to consume from it
    channel.assertQueue(queue, {
      durable: true,
    });

    channel.consume(
      queue,
      async function (msg) {
        try {
          var url = msg.content.toString();
          console.log(" [x] Received %s", url);

          // Run the scraper
          await runScraper(url);

          // Acknowledge the message
          channel.ack(msg);
          console.log(" [x] Message processed and acknowledged");
        } catch (error) {
          console.error("Error processing message:", error);

          // Optionally, reject the message and requeue it
          channel.nack(msg, false, true);
        }
      },
      {
        // automatic acknowledgment mode,
        // see /docs/confirms for details
        noAck: false,
      }
    );
  });
});
