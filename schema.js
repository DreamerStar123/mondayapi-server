const {
    create_column,
    change_simple_column_value
} = require('./modules/monday');

const createOpenJobColumns = async (board_id) => {
    await create_column(board_id, "ship_date", "Ship Date", "date");
    await create_column(board_id, "due_date", "Due Date", "date");
    await create_column(board_id, "sales_order", "Sales_Order", "text");
    await create_column(board_id, "so_line", "SO_Line", "text");
    await create_column(board_id, "status", "Status", "status");
    await create_column(board_id, "order_qty", "Order_Qty", "numbers");
    await create_column(board_id, "shipped_qty", "Shipped_Qty", "numbers");
    await create_column(board_id, "open_qty", "Open_Qty", "numbers");
}

const createMachineStatusColumns = async (board_id) => {
    await create_column(board_id, "vendor", "VENDOR", "text");
    await create_column(board_id, "po", "PO #", "text");
    await create_column(board_id, "due_date", "PO Due Date", "date");
    await create_column(board_id, "order_qty", "Material PO Qty", "numbers");
    await create_column(board_id, "act_qty", "Material PO Rcvd", "numbers");
    await create_column(board_id, "type", "Type", "text");
    await create_column(board_id, "job_qty", "Job Qty", "numbers");
    await create_column(board_id, "so_order_qty", "Order Qty", "numbers");
    await create_column(board_id, "so_shipped_qty", "Shipped Qty", "numbers");
    await create_column(board_id, "so_open_qty", "Open Qty", "numbers");
}

const createMatOrderColumns = async (board_id) => {
    await create_column(board_id, "vendor", "VENDOR", "text");
    await create_column(board_id, "po", "PO #", "text");
    await create_column(board_id, "due_date", "PO Due Date", "date");
    await create_column(board_id, "job_qty", "Job Qty", "numbers");
    await create_column(board_id, "order_qty", "Material PO Qty", "numbers");
    await create_column(board_id, "act_qty", "Material PO Rcvd", "numbers");
}

const createOpenMachineColumns = async (board_id) => {
    await create_column(board_id, "vendor", "VENDOR", "text");
    await create_column(board_id, "job_order_qty", "Job Order Qty", "numbers");
    await create_column(board_id, "opr_service", "Operation Service", "text");
    await create_column(board_id, "po", "PO #", "text");
    await create_column(board_id, "due_date", "PO Due Date", "date");
    await create_column(board_id, "po_order_qty", "Material PO Qty", "numbers");
    await create_column(board_id, "act_qty", "Material PO Rcvd", "numbers");
    await create_column(board_id, "last_recv_date", "Last Recv Date", "date");
}

const createNbrColumns = async (board_id) => {
    await create_column(board_id, "due_date", "Due Date", "date");
    await create_column(board_id, "material", "Material", "text");
    await create_column(board_id, "description", "Description", "text");
    await create_column(board_id, "pick_buy", "Pick Buy Indicator", "text");
    await create_column(board_id, "status", "Status", "status");
    await create_column(board_id, "est_qty", "Est Qty", "numbers");
    await create_column(board_id, "act_qty", "Act Qty", "numbers");
    await create_column(board_id, "delta", "Delta", "numbers");
}

const createNbsColumns = async (board_id) => {
    await create_column(board_id, "material", "Material", "text");
    await create_column(board_id, "due_date", "Due Date", "date");
    await create_column(board_id, "mat_desc", "Mat_Desc", "text");
    await create_column(board_id, "job_desc", "Job_Desc", "text");
    await create_column(board_id, "pick_buy", "Pick Buy Indicator", "text");
    await create_column(board_id, "status", "Status", "status");
    await create_column(board_id, "est_qty", "Est Qty", "numbers");
    await create_column(board_id, "act_qty", "Act Qty", "numbers");
    await create_column(board_id, "delta", "Delta", "numbers");
}

const createGanttColumns = async (board_id) => {
    await create_column(board_id, "due_date", "Due Date", "date");
    await create_column(board_id, "customer", "Customer", "text");
    await create_column(board_id, "material", "Material", "text");
    await create_column(board_id, "order_qty", "Order Qty", "numbers");
    await create_column(board_id, "shipped_qty", "Shipped Qty", "numbers");
    await create_column(board_id, "delta", "Delta", "numbers");
    await create_column(board_id, "status", "Status", "status");
    await create_column(board_id, "onhand_qty", "On Hand Qty", "numbers");
}

(async () => {
    // await createOpenJobColumns(1294186867);
    // await createMachineStatusColumns(1294186963);
    // await createMatOrderColumns(1294187009);
    // await createOpenMachineColumns(1294187047);
    // await createNbrColumns(5333111913);
    // await createNbsColumns(5338467380);
    // await createNbsColumns(5338470037);
    await createGanttColumns(1294270127);
})();