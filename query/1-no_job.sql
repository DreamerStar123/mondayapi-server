SELECT
    dbo.SO_Detail.Promised_Date,
    dbo.SO_Detail.Sales_Order,
    dbo.SO_Detail.SO_Line,
    dbo.SO_Detail.Material,
    dbo.SO_Detail.Order_Qty,
    dbo.SO_Detail.Shipped_Qty,
    dbo.SO_Detail.Job,
    dbo.Material_Location.On_Hand_Qty,
    dbo.SO_Detail.Order_Qty - dbo.SO_Detail.Shipped_Qty AS Open_Qty,
    dbo.SO_Detail.Status,
    dbo.SO_Detail.Last_Updated
FROM (dbo.SO_Detail LEFT JOIN dbo.Job ON dbo.SO_Detail.Job = dbo.Job.Job) LEFT JOIN dbo.Material_Location ON dbo.SO_Detail.Material = dbo.Material_Location.Material
INNER JOIN dbo.SO_Header ON dbo.SO_Detail.Sales_Order = dbo.SO_Header.Sales_Order
WHERE (((dbo.SO_Detail.Order_Qty - dbo.SO_Detail.Shipped_Qty) > 0) AND ((dbo.SO_Detail.Status) = 'open' OR (dbo.SO_Detail.Status) = 'backorder') AND ((dbo.Job.Job) Is Null))
ORDER BY dbo.SO_Detail.Promised_Date, dbo.SO_Detail.Sales_Order, dbo.SO_Detail.SO_Line;
