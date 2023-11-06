SELECT
    dbo.SO_Detail.Sales_Order,
    dbo.SO_Detail.SO_Line,
    dbo.SO_Header.Order_Date,
    dbo.SO_Detail.Material,
    dbo.SO_Detail.Promised_Date,
    dbo.SO_Detail.Status,
    dbo.SO_Detail.Order_Qty,
    dbo.SO_Detail.Shipped_Qty,
    dbo.SO_Detail.Order_Qty - dbo.SO_Detail.Shipped_Qty AS Open_Qty
FROM
    dbo.SO_Detail
    INNER JOIN dbo.SO_Header ON dbo.SO_Detail.Sales_Order = dbo.SO_Header.Sales_Order
WHERE
    (
        dbo.SO_Detail.Status = 'open'
        AND dbo.SO_Detail.Order_Qty - dbo.SO_Detail.Shipped_Qty <> 0
    )
    OR dbo.SO_Detail.Status = 'Backorder'
ORDER BY
    SO_Detail.Sales_Order;