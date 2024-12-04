import { ethers } from "hardhat";
import { OrderTrackerAddress } from "../contract-address";

async function createOrder() {
  console.log(
    "=========================Start creating order======================="
  );
  const signers = await ethers.getSigners();

  const orderTrackingContract = await ethers.getContractAt(
    "OrderTracker",
    OrderTrackerAddress,
    signers[0]
  );

  //create order
  const newOrder = {
    packageId: 100,
    sender: "Me",
    recepient: "You",
    dispatchTime: 123,
    deliveryTime: 321,
    status: 0,
    exists: true,
  };

  try {
    const createOrderTx = await orderTrackingContract.createOrder(newOrder);
    await createOrderTx.wait(1);

    console.log(
      "========================Success create order========================"
    );
  } catch (e) {
    if (e.toString().includes("reverted with an unrecognized custom error")) {
      const decodedError = orderTrackingContract.interface.parseError(
        e.data.data
      );
      const errorMessage = decodedError?.name;

      console.log(
        "Error when creating the order with custom error: ",
        errorMessage
      );
    } else {
      console.log("Error when creating the order: ", e);
    }
  }
}

createOrder()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error(error);
    process.exit(1);
  });
