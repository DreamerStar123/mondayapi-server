SELECT
    dbo.SO_Detail.Promised_Date,
    dbo.SO_Detail.Sales_Order,
    dbo.SO_Detail.SO_Line,
    dbo.SO_Detail.Material,
    dbo.SO_Detail.Order_Qty,
    dbo.SO_Detail.Shipped_Qty,
    dbo.Material_Location.On_Hand_Qty,
    dbo.SO_Detail.Order_Qty - dbo.SO_Detail.Shipped_Qty AS Open_Qty,
    dbo.SO_Detail.Status,
    dbo.SO_Detail.Last_Updated
FROM
    dbo.SO_Detail
    LEFT JOIN dbo.Material_Location ON dbo.SO_Detail.Material = dbo.Material_Location.Material
WHERE
    CAST(dbo.SO_Detail.Last_Updated AS DATE) >= CAST(GETDATE() - 1 AS DATE)
ORDER BY
    dbo.SO_Detail.Promised_Date,
    dbo.SO_Detail.Sales_Order,
    dbo.SO_Detail.SO_Line;