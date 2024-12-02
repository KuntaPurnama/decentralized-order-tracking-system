import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers, network } from "hardhat";
import { assert, expect } from "chai";
import { developmentChains } from "../hardhat-helper-config";
import { OrderTracker } from "../typechain-types";
import { ContractTransactionResponse } from "ethers";

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("OrderTracker", function () {

      async function deployOrderTracker() {
        const OrderTracker = await ethers.getContractFactory("OrderTracker");
        const orderTracker = await OrderTracker.deploy();

        return orderTracker;
      }

      describe("Deployment", function () {
        it("Success get the iniate storage value", async function () {
          const orderTracker = await loadFixture(deployOrderTracker);
          const orders = await orderTracker.getListOfOrders();
          assert.equal(orders.length, 0);
        });
      });

      describe("Create Order", function (){
        let orderTracker: OrderTracker & {
          deploymentTransaction(): ContractTransactionResponse;
        };

        this.beforeAll(async function () {
          orderTracker = await loadFixture(deployOrderTracker);
        });

        it("Create order failed, status is not Dispatched", async function () {
          const newOrder = {
            packageId: 100,
            sender: "Me",
            recepient: "You",
            dispatchTime: 123,
            deliveryTime: 321,
            status: 1,
            exists: true
          }

          await expect(orderTracker.createOrder(newOrder)).to.be
          .revertedWithCustomError(orderTracker, "OrderTracker_StatusShouldBeDispatched")
          .withArgs(100);
        });

        it("Create order success", async function () {
          const newOrder = {
            packageId: 100,
            sender: "Me",
            recepient: "You",
            dispatchTime: 123,
            deliveryTime: 321,
            status: 0,
            exists: true
          }

          await orderTracker.createOrder(newOrder);
          const orderList = await orderTracker.getListOfOrders();
          const order = await orderTracker.getOrder(100);
          const history = await orderTracker.getOrderHistory(100);

          assert.equal(orderList.length, 1);
          assert.equal(order.packageId.toString(), "100");
          assert.equal(history.length, 1);
          assert.equal(history[0].packageId.toString(), "100");
        });
      });

      describe("Update Order Status", function () {
        let orderTracker: OrderTracker & {
          deploymentTransaction(): ContractTransactionResponse;
        };

        this.beforeAll(async function () {
          orderTracker = await loadFixture(deployOrderTracker);
          const newOrder = {
            packageId: 100,
            sender: "Me",
            recepient: "You",
            dispatchTime: 123,
            deliveryTime: 321,
            status: 0,
            exists: true
          }

          await orderTracker.createOrder(newOrder);
        });

        it("Update order failed, not owner/deployer", async function () {
          const signers = await ethers.getSigners();
          const secondUser = signers[1];
          const secondOrderTracker = orderTracker.connect(secondUser);
          await expect(secondOrderTracker.updateOrderStatus(100, 1, "Order still on the way")).to.be
          .reverted;
        });

        it("Update order failed, order not found", async function () {
          await expect(orderTracker.updateOrderStatus(101, 1, "Order still on the way")).to.be
          .revertedWithCustomError(orderTracker, "OrderTracker_OrderNotFound")
          .withArgs(101);
        });

        it("Update order failed, cannot update with same status", async function () {
          await expect(orderTracker.updateOrderStatus(100, 0, "Order still on the way")).to.be
          .revertedWithCustomError(orderTracker, "OrderTracker_CannotUpdateWithTheSameStatus")
          .withArgs(100);
        });

        it("Update order success", async function () {
          const id = 100;
          const order = await orderTracker.getOrder(id);
          const history = await orderTracker.getOrderHistory(id);

          assert.equal(order.status.toString(), "0");
          assert.equal(history.length, 1);
          assert.equal(history[0].status.toString(), "0");

          await orderTracker.updateOrderStatus(id, 1, "Order still on the way");
          
          const updatedOrder = await orderTracker.getOrder(id);
          const updatedHistory = await orderTracker.getOrderHistory(id);
          const latestHistory = updatedHistory[updatedHistory.length-1];

          assert.equal(updatedOrder.status.toString(), "1");
          assert.equal(updatedHistory.length, 2);
          assert.equal(latestHistory.status.toString(), "1");
          assert.equal(latestHistory.note.toString(), "Order still on the way");
        });
      });

      describe("Get Order Data", function () {
        let orderTracker: OrderTracker & {
          deploymentTransaction(): ContractTransactionResponse;
        };

        this.beforeAll(async function () {
          orderTracker = await loadFixture(deployOrderTracker);
          const newOrder = {
            packageId: 100,
            sender: "Me",
            recepient: "You",
            dispatchTime: 123,
            deliveryTime: 321,
            status: 0,
            exists: true
          }

          await orderTracker.createOrder(newOrder);
        });

        it("Failed get order data, not exists", async function () {
          await expect(orderTracker.getOrder(101)).to.be
          .revertedWithCustomError(orderTracker, "OrderTracker_OrderNotFound")
          .withArgs(101);
        });

        it("Failed get order history data, not exists", async function () {
          await expect(orderTracker.getOrderHistory(101)).to.be
          .revertedWithCustomError(orderTracker, "OrderTracker_OrderNotFound")
          .withArgs(101);
        });
      });
    });
