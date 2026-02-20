import express from "express";

export const app = express();

const port = process.env.NODE_PORT || 6100;
app.listen(port , () => {
    console.log(`server started running on the server ${port} and db running on the port ${5432}`)
});
