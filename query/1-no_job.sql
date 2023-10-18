SELECT
    dbo.SO_Detail.Promised_Date,
    dbo.SO_Detail.Sales_Order,
    dbo.SO_Detail.SO_Line,
    dbo.SO_Detail.Status AS SO_Status,
    dbo.SO_Detail.Order_Qty,
    dbo.SO_Detail.Shipped_Qty,
    dbo.SO_Detail.Order_Qty - dbo.SO_Detail.Shipped_Qty AS Open_Qty,
    dbo.SO_Detail.Last_Updated
FROM
    dbo.SO_Detail
WHERE
    dbo.SO_Detail.Status = 'open'
    AND dbo.SO_Detail.Order_Qty - dbo.SO_Detail.Shipped_Qty <> 0
    AND dbo.SO_Detail.Job IS NULL
ORDER BY
    dbo.SO_Detail.Promised_Date;