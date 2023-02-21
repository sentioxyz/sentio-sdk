// import { coin_client, loadAllTypes, string__client } from "./builtin/0x1.js";
// import { defaultMoveCoder } from "./move-coder.js";
// import { ModuleClient } from "./module-client.js";
// import { AptosClient } from "aptos-sdk";
// import { expect } from "chai";
//
describe('type view calls', () => {
  test('empty', () => {})
  //   loadAllTypes(defaultMoveCoder())
  //   const client = new AptosClient("https://testnet.aptoslabs.com")
  //
  //   test("raw call", async () => {
  //     const mc = new ModuleClient(client)
  //     const decoded = await mc.viewDecoded(
  //         "0x1::coin::balance",
  //         ["0x1::aptos_coin::AptosCoin"],
  //         ["0xc0cbc38f05f1aed5467b889ef704135bc01f0a492d6fd28ef499d19e7bb58108"]
  //     )
  //     expect(decoded).eql([191195941n])
  //   })
  //
  //   test("coin call", async () => {
  //     const mc = new coin_client(client)
  //     const decoded = await mc.balance(["0x1::aptos_coin::AptosCoin"], [
  //           "0xc0cbc38f05f1aed5467b889ef704135bc01f0a492d6fd28ef499d19e7bb58108"
  //         ]
  //     )
  //     expect(decoded).eql([191195941n])
  //   })
  //
  //   test("gen code call", async () => {
  //     //
  //     const mc = new string__client(client)
  //     const decoded = await mc.bytes([], [
  //         "0xc0cbc38f05f1aed5467b889ef704135bc01f0a492d6fd28ef499d19e7bb58108"
  //       ]
  //     )
  //     console.log(decoded)
  //   })
  //
  //   test("coin decimal", async () => {
  //     const mc = new coin_client(client)
  //     const decoded = await mc.supply(["0x1::aptos_coin::AptosCoin"], [
  //         ]
  //     )
  //     expect(decoded).eql(18)
  //   })
})
