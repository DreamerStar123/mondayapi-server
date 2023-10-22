SELECT
    dbo.SO_Detail.Promised_Date,
    dbo.SO_Header.Customer,
    dbo.SO_Detail.Job,
    dbo.SO_Detail.Material,
    dbo.SO_Detail.Order_Qty,
    dbo.SO_Detail.Shipped_Qty,
    dbo.SO_Detail.Shipped_Qty - dbo.SO_Detail.Order_Qty AS Delta,
    dbo.SO_Detail.Status,
    dbo.Material_Location.On_Hand_Qty
FROM
    dbo.SO_Detail
    LEFT JOIN dbo.SO_Header ON dbo.SO_Detail.Sales_Order = dbo.SO_Header.Sales_Order
    LEFT JOIN dbo.Material_Location ON dbo.SO_Detail.Material = dbo.Material_Location.Material
WHERE
    dbo.SO_Header.Customer = 'enteg'
    AND dbo.SO_Detail.Shipped_Qty - dbo.SO_Detail.Order_Qty < 0
    AND (dbo.SO_Detail.Status = 'open' OR dbo.SO_Detail.Status = 'Backorder')
ORDER BY
    dbo.SO_Detail.Promised_Date;