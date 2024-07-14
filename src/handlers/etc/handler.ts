// public async SendReply(reply: IReply): Promise<void> {
//     const sendModal = await SendReplyModal(
//         this.app,
//         this.sender,
//         this.read,
//         this.persis,
//         this.modify,
//         this.room,
//         reply,
//         this.language,
//     );

//     if (sendModal instanceof Error) {
//         this.app.getLogger().error(sendModal.message);
//         return;
//     }
//     const triggerId = this.triggerId;
//     if (triggerId) {
//         await this.modify
//             .getUiController()
//             .openSurfaceView(sendModal, { triggerId }, this.sender);
//     }
//     return;
// }
// public async EditReply(reply: IReply, body?: string): Promise<void> {
//     const editModal = await EditReplyModal(
//         this.app,
//         this.sender,
//         this.read,
//         this.persis,
//         this.modify,
//         this.room,
//         reply,
//         this.language,
//         body,
//     );

//     if (editModal instanceof Error) {
//         this.app.getLogger().error(editModal.message);
//         return;
//     }
//     const triggerId = this.triggerId;
//     if (triggerId) {
//         await this.modify
//             .getUiController()
//             .openSurfaceView(editModal, { triggerId }, this.sender);
//     }
//     return;
// }
// public async DeleteReply(reply: IReply): Promise<void> {
//     const deleteModal = await confirmDeleteModal(
//         this.app,
//         this.sender,
//         this.read,
//         this.persis,
//         this.modify,
//         this.room,
//         reply,
//         this.language,
//     );

//     if (deleteModal instanceof Error) {
//         this.app.getLogger().error(deleteModal.message);
//         return;
//     }
//     const triggerId = this.triggerId;
//     if (triggerId) {
//         await this.modify
//             .getUiController()
//             .openSurfaceView(deleteModal, { triggerId }, this.sender);
//     }
//     return;
// }
