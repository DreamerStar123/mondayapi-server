SELECT
	dbo.Material_Req.Material,
	dbo.Material_Req.Job,
	dbo.Delivery.Promised_Date,
	dbo.Material_Req.Description AS Mat_Desc,
	dbo.Job.Part_Number,
	dbo.Job.Description AS Job_Desc,
	dbo.Material_Req.Pick_Buy_Indicator,
	dbo.Material_Req.Type,
	dbo.Job.Status,
	dbo.Material_Req.Est_Qty,
	dbo.Material_Req.Act_Qty,
	[Act_Qty] - [Est_Qty] AS Delta,
	dbo.Material_Location.On_Hand_Qty
FROM
	dbo.Material_Req
	LEFT JOIN dbo.Delivery ON dbo.Material_Req.Job = dbo.Delivery.Job
	LEFT JOIN dbo.Job ON dbo.Delivery.Job = dbo.Job.Job
	LEFT JOIN dbo.Material_Location ON dbo.Material_Req.Material = dbo.Material_Location.Material
WHERE
	dbo.Material_Req.Job NOT LIKE 't*'
	AND dbo.Material_Req.Type = 's'
	AND dbo.Job.Status NOT LIKE 'closed'
ORDER BY
	dbo.Material_Req.Material,
	dbo.Delivery.Promised_Date;