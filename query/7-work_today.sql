SELECT
    dbo.Job_Operation_Time.Employee,
    dbo.Job_Operation.Work_Center,
    dbo.Job.Job,
    dbo.Job.Part_Number,
    dbo.Job_Operation.Operation_Service,
    dbo.Job_Operation_Time.Act_Setup_Hrs,
    dbo.Job_Operation_Time.Act_Run_Hrs,
    dbo.Job_Operation_Time.Act_Run_Qty,
    dbo.Job_Operation_Time.Act_Scrap_Qty,
    dbo.Job_Operation_Time.Work_Date,
    dbo.Employee.User_Values
FROM
    dbo.Job_Operation_Time
    INNER JOIN dbo.Job_Operation ON dbo.Job_Operation_Time.Job_Operation = dbo.Job_Operation.Job_Operation
    INNER JOIN dbo.Job ON dbo.Job_Operation.Job = dbo.Job.Job
    INNER JOIN dbo.Employee ON dbo.Job_Operation_Time.Employee = dbo.Employee.Employee
WHERE
    CAST(dbo.Job_Operation_Time.Work_Date AS DATE) = CAST(GETDATE() AS DATE)
ORDER BY
    dbo.Job_Operation_Time.Employee,
    dbo.Job.Job,
    dbo.Job_Operation.Operation_Service,
    dbo.Job_Operation_Time.Work_Date;