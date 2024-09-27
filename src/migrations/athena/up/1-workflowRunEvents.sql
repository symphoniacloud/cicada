CREATE TABLE IF NOT EXISTS %%DATABASE_NAME%%.github_workflow_run_events
(
    account_id bigint,
    account_name string,
    account_type string,
    repo_id bigint,
    repo_name string,
    repo_html_url string,
    workflow_id bigint,
    workflow_name string,
    path string,
    workflow_html_url string,
    workflow_badge_url string,
    id bigint,
    run_number bigint,
    run_attempt bigint,
    display_title string,
    event string,
    status string,
    head_branch string,
    head_sha string,
    conclusion string,
    created_at string,
    updated_at string,
    run_started_at string,
    html_url string,
    actor struct<login:string,id:bigint,avatar_url:string,html_url:string>
)
    LOCATION 's3://%%BUCKET_NAME%%/tables/github_workflow_run_events/'
    TBLPROPERTIES
(
    'table_type' =
    'ICEBERG'
)
