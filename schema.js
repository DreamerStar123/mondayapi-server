const {
    create_column,
    change_simple_column_value
} = require('./modules/monday');

const createOpenJobColumns = async (board_id) => {
    await create_column(board_id, "date4", "Ship Date", "date");
    await create_column(board_id, "date4", "Due Date", "date");
    await create_column(board_id, "text", "Sales_Order", "text");
    await create_column(board_id, "text0", "SO_Line", "text");
    await create_column(board_id, "status3", "Status", "status");
    await create_column(board_id, "numbers", "Order_Qty", "numbers");
    await create_column(board_id, "numbers1", "Shipped_Qty", "numbers");
    await create_column(board_id, "numbers7", "Open_Qty", "numbers");
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

// vendor, PO#, PO due date, job qty, material PO qty, material po rcvd
const createMatOrderColumns = async (board_id) => {
    await create_column(board_id, "vendor", "VENDOR", "text");
    await create_column(board_id, "po", "PO #", "text");
    await create_column(board_id, "due_date", "PO Due Date", "date");
    await create_column(board_id, "job_qty", "Job Qty", "numbers");
    await create_column(board_id, "order_qty", "Material PO Qty", "numbers");
    await create_column(board_id, "act_qty", "Material PO Rcvd", "numbers");
}

// 	Vendor, Job_Order_Qty, Operation_Service, Material_Req, PO, Due_Date, PO_Order_Qty, Act_Qty, Last_Recv_Date 
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

(async () => {
    await createOpenJobColumns(1293185486);
    await createMachineStatusColumns(1293185622);
    await createMatOrderColumns(1293185685);
    await createOpenMachineColumns(1293186060);
})();