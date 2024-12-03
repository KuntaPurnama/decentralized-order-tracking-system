// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

//Error code
error OrderTracker_OrderNotFound(uint256 packageId);
error OrderTracker_StatusShouldBeDispatched(uint256 packageId);
error OrderTracker_CannotUpdateWithTheSameStatus(uint256 packageId);

/**
 * @title decentralized order tracking system
 * @author Tano
 * @notice This contract is to implement secure and seamless decentralized order tracking system
 */
contract OrderTracker is Ownable {
    //Define Enum
    enum OrderStatus {
        Dispatched,
        InTransit,
        Delivered
    }

    //Define Order Struct
    struct Order {
        uint256 packageId;
        string sender;
        string recepient;
        uint256 dispatchTime;
        uint256 deliveryTime;
        OrderStatus status;
        bool exists;
    }

    struct OrderHistory {
        uint256 packageId;
        OrderStatus status;
        string note;
        uint256 updatedTime;
    }

    //Define state variable
    mapping(uint256 => Order) private s_packageIdToOrder;
    mapping(uint256 => OrderHistory[]) private s_packageIdToOrderHistory;

    Order[] private s_listOfOrders;

    //Define events
    event SuccessCreateOrder(
        uint256 indexed packageId,
        address indexed creator
    );

    event SuccessUpdateOrder(
        uint256 indexed packageId,
        address indexed creator,
        OrderStatus indexed status
    );

    constructor() Ownable(msg.sender) {}

    /**
     * @dev creating new order by passing the order struct as paramater and record it in related state variable
     */
    function createOrder(Order memory order) external onlyOwner{
        //New order status can't be any other than Dispatched
        if (order.status != OrderStatus.Dispatched) {
            revert OrderTracker_StatusShouldBeDispatched(order.packageId);
        }

        //set the exists true so it means the order is recorder and exists in our storage
        order.exists = true;

        s_listOfOrders.push(order);
        s_packageIdToOrder[order.packageId] = order;

        OrderHistory memory history = OrderHistory({
            packageId: order.packageId,
            status: order.status,
            updatedTime: block.timestamp,
            note: "Order is created"
        });

        s_packageIdToOrderHistory[order.packageId].push(history);
        emit SuccessCreateOrder(order.packageId, msg.sender);
    }

    /**
     * @dev We pass enum as parameter so we don't need to manually validate if the given input is valid enum
     * If the input is undefined enum value, it automatically give error before it reaches our function
     * We also need to check the order existence
     * User only can update status into different status
     */
    function updateOrderStatus(
        uint256 packageId,
        OrderStatus status,
        string memory note
    ) external onlyOwner {
        Order memory order = s_packageIdToOrder[packageId];

        if (!order.exists) {
            revert OrderTracker_OrderNotFound(packageId);
        }

        if (order.status == status) {
            revert OrderTracker_CannotUpdateWithTheSameStatus(order.packageId);
        }

        //update the order status
        s_packageIdToOrder[packageId].status = status;

        //Add the order status history
        OrderHistory memory history = OrderHistory({
            packageId: order.packageId,
            status: status,
            updatedTime: block.timestamp,
            note: note
        });

        s_packageIdToOrderHistory[order.packageId].push(history);
        emit SuccessUpdateOrder(order.packageId, msg.sender, status);
    }

    /**
     * @dev getter function
     */
    function getListOfOrders() public view returns (Order[] memory) {
        return s_listOfOrders;
    }

    function getOrder(uint256 packageId) public view returns (Order memory) {
        Order memory order = s_packageIdToOrder[packageId];

        if (!order.exists) {
            revert OrderTracker_OrderNotFound(packageId);
        }

        return order;
    }

    function getOrderHistory(
        uint256 packageId
    ) public view returns (OrderHistory[] memory) {
        Order memory order = s_packageIdToOrder[packageId];

        if (!order.exists) {
            revert OrderTracker_OrderNotFound(packageId);
        }

        return s_packageIdToOrderHistory[packageId];
    }
}
