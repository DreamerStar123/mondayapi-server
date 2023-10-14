SELECT
	dbo.Job.Job,
	dbo.Job.Part_Number,
	dbo.Job_Operation.Vendor,
	dbo.Job.Order_Quantity AS Job_Order_Qty,
	dbo.Job_Operation.Operation_Service,
	dbo.Source.Material_Req,
	dbo.PO_Detail.PO,
	dbo.PO_Detail.Due_Date,
	dbo.PO_Detail.Order_Quantity AS PO_Order_Qty,
	dbo.Source.Act_Qty,
	dbo.Source.Last_Recv_Date,
	dbo.Job.Last_Updated
FROM
	dbo.Job
	LEFT JOIN (
		dbo.Job_Operation
		LEFT JOIN dbo.Source ON dbo.Job_Operation.Job_Operation = dbo.Source.Job_Operation
		LEFT JOIN dbo.PO_Detail ON dbo.Source.PO_Detail = dbo.PO_Detail.PO_Detail 
	) ON dbo.Job.Job = dbo.Job_Operation.Job 
WHERE
	(
		( dbo.Job.Job NOT LIKE 't*' AND dbo.Job_Operation.Vendor = 'SWISS' ) 
		OR dbo.Job_Operation.Vendor = 'RPABR' 
		OR dbo.Job_Operation.Vendor = 'SAWTE' 
		OR dbo.Job_Operation.Vendor = 'ROGER' 
		OR dbo.Job_Operation.Vendor = 'CZMAC' 
		OR dbo.Job_Operation.Vendor = 'PARFU' 
		OR dbo.Job_Operation.Vendor = 'OVERF' 
		OR dbo.Job_Operation.Vendor = 'marlb' 
		OR dbo.Job_Operation.Vendor = 'micrg' 
		OR dbo.Job_Operation.Vendor = 'KAGER' 
	) 
	AND PO_Detail.Status <> 'Closed'
	-- AND CAST( dbo.Job.Last_Updated AS DATE ) = CAST( GETDATE () - 1 AS DATE ) 
ORDER BY
	dbo.Job.Job