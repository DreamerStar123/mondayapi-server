SELECT
    dbo.Job.Job,
    dbo.Job_Operation.Vendor,
    dbo.Job.Part_Number,
    dbo.Job_Operation.Operation_Service,
    dbo.Source.Material_Req,
    dbo.PO_Detail.PO,
    dbo.PO_Detail.Status,
    dbo.Source.Due_Date,
    dbo.Job.Order_Quantity,
    dbo.Source.POOrdered_Qty,
    dbo.Source.Act_Qty,
    dbo.Source.Last_Recv_Date
FROM
    dbo.Job
    LEFT JOIN (
        (
            dbo.Job_Operation
            LEFT JOIN dbo.Source ON dbo.Job_Operation.Job_Operation = dbo.Source.Job_Operation
        )
        LEFT JOIN dbo.PO_Detail ON dbo.Source.PO_Detail = dbo.PO_Detail.PO_Detail
    ) ON dbo.Job.Job = dbo.Job_Operation.Job
WHERE
    (
        ((dbo.Job.Job) Not Like 't*')
        AND (
            dbo.Job_Operation.Vendor = 'T&TAN'
            OR dbo.Job_Operation.Vendor = 'A&GCE'
            OR dbo.Job_Operation.Vendor = 'ACCUR'
            OR dbo.Job_Operation.Vendor = 'COATI'
            OR dbo.Job_Operation.Vendor = 'CILIN'
            OR dbo.Job_Operation.Vendor = 'ACCUG'
            OR dbo.Job_Operation.Vendor = 'NEWME'
        )
        AND (dbo.PO_Detail.PO Is Not Null)
        AND (dbo.PO_Detail.Status = 'OPEN')
    )
ORDER BY
    dbo.Source.Due_Date;