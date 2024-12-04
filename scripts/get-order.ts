import { ethers } from "hardhat";
import { OrderTrackerAddress } from "../contract-address";

async function getOrder() {
  console.log(
    "=========================Start getting order======================="
  );
  const signers = await ethers.getSigners();

  const orderTrackingContract = await ethers.getContractAt(
    "OrderTracker",
    OrderTrackerAddress,
    signers[0]
  );

  try {
    //get orderd details
    //pass the package id from the package id that we input in create-order script
    const order = await orderTrackingContract.getOrder("100");

    const orderDetail = {
      packageId: order[0].toString(),
      sender: order[1],
      recepient: order[2],
      dispatchTime: order[3].toString(),
      deliveryTime: order[4].toString(),
      status: convertStatusEnumToString(order[5].toString()),
    };
    console.log("Order Detail: ", orderDetail);

    //Get order history Detail
    const orderHistory = await orderTrackingContract.getOrderHistory("100");
    const orderHistoryDetail = [];
    for (let index = 0; index < orderHistory.length; index++) {
      const history = {
        packageId: orderHistory[index][0].toString(),
        status: convertStatusEnumToString(orderHistory[index][1].toString()),
        note: orderHistory[index][2],
        updatedTime: orderHistory[index][3].toString(),
      };
      orderHistoryDetail.push(history);
    }
    console.log("Order History Detail: ", orderHistoryDetail);

    console.log(
      "========================Success get order========================"
    );
  } catch (e) {
    if (e.toString().includes("reverted with an unrecognized custom error")) {
      const decodedError = orderTrackingContract.interface.parseError(
        e.data.data
      );
      const errorMessage = decodedError?.name;

      console.log(
        "Error when getting the order with custom error: ",
        errorMessage
      );
    } else {
      console.log("Error when getting the order: ", e);
    }
  }
}

const convertStatusEnumToString = (status: string) => {
  if (status == "0") {
    return "Dispatched";
  }

  if (status == "1") {
    return "InTransit";
  }

  return "Delivered";
};

getOrder()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error(error);
    process.exit(1);
  });
