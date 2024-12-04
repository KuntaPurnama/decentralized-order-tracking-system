import { ethers } from "hardhat";
import { OrderTrackerAddress } from "../contract-address";

async function createOrder() {
  console.log(
    "=========================Start updating order======================="
  );
  const signers = await ethers.getSigners();

  const orderTrackingContract = await ethers.getContractAt(
    "OrderTracker",
    OrderTrackerAddress,
    signers[0]
  );

  try {
    const updateOrderTx = await orderTrackingContract.updateOrderStatus(
      100,
      convertStringToEnumValue("In_Transit"),
      "Just transit in Jakarta"
    );
    await updateOrderTx.wait(1);

    console.log(
      "========================Success update order========================"
    );
  } catch (e) {
    //check if the error comes from the custom error we made, if yes then reconstruct the error message
    if (e.toString().includes("reverted with an unrecognized custom error")) {
      const decodedError = orderTrackingContract.interface.parseError(
        e.data.data
      );
      const errorMessage = decodedError?.name;

      console.log(
        "Error when updating the order with custom error: ",
        errorMessage
      );
    } else {
      console.log("Error when updating the order: ", e);
    }
  }
}

const convertStringToEnumValue = (status: string) => {
  if (status == "Dispatched") {
    return "0";
  }

  if (status == "In_Transit") {
    return "1";
  }

  return "2";
};

createOrder()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error(error);
    process.exit(1);
  });
