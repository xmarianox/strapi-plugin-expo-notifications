

module.exports = () => ({
  buildMessage(pushToken, data) {
    const { title, subtitle, contentType, entryId } = data;
    const messageWithoutData = {
      to: pushToken,
      sound: "default",
      title: title,
      body: subtitle,
    };
    const messageWithData = {
      ...messageWithoutData,
      data: { contentType: data.contentType, entryId: data.entryId },
    };
    const messagetoSend =
      contentType && contentType !== "" && entryId && entryId !== ""
        ? messageWithData
        : messageWithoutData;
    console.log("Plugin will send the following message", messagetoSend);
    return messagetoSend;
  },
  async sendWithExpo(expo, chunks, strapi) {
    let tickets = [];
    console.log("chunks", chunks);
    for (let chunk of chunks) {
      try {
        let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        console.log("ticketChunk", ticketChunk);
        tickets.push(...ticketChunk);

        // Guardar solo una notificación por envío (no por destinatario)
        if (chunk.length > 0) {
          const firstMessage = chunk[0];
          await strapi.documents("api::nofication.nofication").create({
            data: {
              title: firstMessage.title,
              subtitle: firstMessage.body || "",
              message: firstMessage.body,
            },
            status: "published",
          });
        }
      } catch (error) {
        console.error(error);
      }
      return tickets;
    }
  },
});
