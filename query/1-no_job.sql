SELECT
    dbo.SO_Detail.Promised_Date,
    dbo.SO_Detail.Sales_Order,
    dbo.SO_Detail.SO_Line,
    dbo.SO_Detail.Material,
    dbo.SO_Detail.Order_Qty,
    dbo.SO_Detail.Shipped_Qty,
    dbo.Material_Location.On_Hand_Qty,
    dbo.SO_Detail.Order_Qty - dbo.SO_Detail.Shipped_Qty AS Open_Qty,
    dbo.SO_Detail.Status
FROM
    dbo.SO_Detail
    LEFT JOIN dbo.Material_Location ON dbo.SO_Detail.Material = dbo.Material_Location.Material
WHERE
    dbo.SO_Detail.Order_Qty - dbo.SO_Detail.Shipped_Qty > 0
    AND (
        dbo.SO_Detail.Status = 'open'
        Or dbo.SO_Detail.Status = 'backorder'
    )
    AND dbo.SO_Detail.Job IS NULL
ORDER BY
    dbo.SO_Detail.Promised_Date,
    dbo.SO_Detail.Sales_Order,
    dbo.SO_Detail.SO_Line;