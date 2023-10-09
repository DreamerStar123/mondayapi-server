SELECT
	Job.Job,
	PO_Header.Vendor,
	PO_Detail.PO,
	PO_Detail.Due_Date,
	PO_Detail.Order_Quantity,
	Material_Req.Act_Qty,
	Material.Type,
	( Job.Make_Quantity + Job.Pick_Quantity ) AS Job_Qty,
	SO_Detail.Order_Qty,
	SO_Detail.Shipped_Qty,
	( SO_Detail.Order_Qty - SO_Detail.Shipped_Qty ) AS Open_Qty 
FROM
	PRODUCTION.dbo.Job Job
	INNER JOIN PRODUCTION.dbo.Material_Req Material_Req ON Job.Job = Material_Req.Job
	LEFT OUTER JOIN PRODUCTION.dbo.Material Material ON Material_Req.Material = Material.Material
	LEFT OUTER JOIN PRODUCTION.dbo.Source Source ON Material_Req.Material_Req = Source.Material_Req
	LEFT OUTER JOIN PRODUCTION.dbo.PO_Detail PO_Detail ON Source.PO_Detail = PO_Detail.PO_Detail
	LEFT OUTER JOIN PRODUCTION.dbo.PO_Header PO_Header ON PO_Detail.PO = PO_Header.PO
	LEFT OUTER JOIN PRODUCTION.dbo.SO_Detail SO_Detail ON Job.Job = SO_Detail.Job 
WHERE
	Job.Status = 'Active' 
	AND Material_Req.Type = 'R' 
	AND Job.Job NOT LIKE 'T%' 
	AND PO_Detail.PO_Type = 0 
ORDER BY
	Job.Job,
	PO_Detail.PO,
	PO_Detail.Line