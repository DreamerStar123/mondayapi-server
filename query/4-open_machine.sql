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
	PO_Header.Issued_By,
	dbo.Job.Last_Updated
FROM
	dbo.Job
	LEFT JOIN (
		dbo.Job_Operation
		LEFT JOIN dbo.Source ON dbo.Job_Operation.Job_Operation = dbo.Source.Job_Operation
		LEFT JOIN dbo.PO_Detail ON dbo.Source.PO_Detail = dbo.PO_Detail.PO_Detail
		LEFT OUTER JOIN dbo.PO_Header PO_Header ON PO_Detail.PO = PO_Header.PO
	) ON dbo.Job.Job = dbo.Job_Operation.Job
WHERE
	(
		(
			dbo.Job.Job NOT LIKE 't*'
			AND dbo.Job_Operation.Vendor = 'SWISS'
		)
		OR dbo.Job_Operation.Vendor = 'RPABR'
		OR dbo.Job_Operation.Vendor = 'SAWTE'
		OR dbo.Job_Operation.Vendor = 'ROGER'
		OR dbo.Job_Operation.Vendor = 'CZMAC'
		OR dbo.Job_Operation.Vendor = 'PARFU'
		OR dbo.Job_Operation.Vendor = 'OVERF'
		OR dbo.Job_Operation.Vendor = 'marlb'
		OR dbo.Job_Operation.Vendor = 'micrg'
		OR dbo.Job_Operation.Vendor = 'KAGER'
		OR dbo.Job_Operation.Vendor = 'FABCO'
	)
	AND PO_Detail.Status <> 'Closed'
ORDER BY
	dbo.Job.Job