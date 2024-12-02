import { ethers } from "hardhat";

//don't forget import hardhat-deploy in hardhat.config.ts
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { developmentChains } from "../hardhat-helper-config";
import { network } from "hardhat";

import { verify } from "../utils/verify";

const deployTickets: DeployFunction = async function ({
  getNamedAccounts,
  deployments,
}: HardhatRuntimeEnvironment) {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  const toWei = (num: Number) => ethers.parseEther(num.toString());
  const isLocalNetwork: boolean = developmentChains.includes(network.name);

  log(`---------------------Deploy Order Tracker System --------------------\n`);

  const contract = await deploy("OrderTracker", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: isLocalNetwork ? 1 : 6,
  });

  if (!isLocalNetwork) {
    await verify(contract.address, []);
  }

  log(`---------------------Deploy Finished --------------------\n`);
};

export default deployTickets;
deployTickets.tags = ["all", "tracker"];
