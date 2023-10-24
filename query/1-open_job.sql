SELECT
    dbo.SO_Detail.Promised_Date,
    dbo.SO_Detail.Sales_Order,
    dbo.SO_Detail.SO_Line,
    dbo.SO_Detail.Status AS SO_Status,
    dbo.SO_Detail.Order_Qty,
    dbo.SO_Detail.Shipped_Qty,
    dbo.Job.Job,
    dbo.Job.Part_Number,
    dbo.SO_Detail.Order_Qty - dbo.SO_Detail.Shipped_Qty AS Open_Qty,
    dbo.Job.Status AS Job_Status,
    dbo.SO_Detail.Last_Updated
FROM
    dbo.SO_Detail
    INNER JOIN dbo.Job ON dbo.SO_Detail.Job = dbo.Job.Job
-- WHERE
    -- CAST(dbo.SO_Detail.Last_Updated AS DATE) >= CAST(GETDATE() - 1 AS DATE)
ORDER BY
    dbo.SO_Detail.Promised_Date;