import WFC from "../WFC/wfc.main";

onmessage = (message: MessageEvent) => {
  const res: Array<Array<Set<string>>> = WFC(message.data);

  postMessage(res);
};