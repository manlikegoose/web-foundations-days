
# SnapShare: Photo App Scaling Plan

## 1. Assumptions

SnapShare is a photo-sharing application where users upload photos and scroll through a feed of photos from people they follow.

The following assumptions are used for this scaling plan:

- The application has 10 million registered users.
- 10% of registered users are active each day.
- Each daily active user uploads one photo per day.
- Each daily active user views 50 feed pages per day.
- Each original photo averages 2 MB.
- Each photo has one thumbnail averaging 50 KB.
- A year contains 365 days.
- Average traffic is spread across 24 hours per day.
- Peak traffic is five times the average traffic.
- Storage estimates use decimal units: 1 TB = 1,000,000 MB.
- Storage estimates include original photos and thumbnails but exclude backups, replicas, database records, and storage overhead.
- Feed views represent requests for feed pages, not individual photos displayed on each page.

## 2. Traffic and Storage Estimates

### Daily Active Users

Daily active users are 10% of the 10 million registered users.

Calculation:

10,000,000 × 10% = 1,000,000 daily active users.

### Upload Traffic

Each daily active user uploads one photo per day.

- Daily uploads: 1,000,000 × 1 = 1,000,000 photos.
- Average uploads per second: 1,000,000 ÷ 86,400 = approximately 11.57 uploads/second.
- Peak uploads per second: 11.57 × 5 = approximately 57.87 uploads/second.

### Feed Traffic

Each daily active user views 50 feed pages per day.

- Daily feed views: 1,000,000 × 50 = 50,000,000 feed views.
- Average feed views per second: 50,000,000 ÷ 86,400 = approximately 578.70 views/second.
- Peak feed views per second: 578.70 × 5 = approximately 2,893.52 views/second.

### Annual Photo Storage

Original photos:

- Annual uploads: 1,000,000 × 365 = 365,000,000 photos.
- Annual original photo storage: 365,000,000 × 2 MB = 730,000,000 MB = 730 TB.

Thumbnails:

- Annual thumbnail storage: 365,000,000 × 50 KB = 18,250,000,000 KB = 18.25 TB.

Total new photo storage per year:

730 TB + 18.25 TB = approximately 748.25 TB.

This estimate assumes that all uploaded photos and their thumbnails are retained for the entire year. It does not include backups, replicas, database data, or storage overhead.

## 3. Read-Heavy or Write-Heavy?

SnapShare is read-heavy because users request feed pages far more frequently than they upload photos. There are 50 feed views for every upload, resulting in approximately 50 million feed views and 1 million uploads per day.

The design should therefore prioritize fast feed delivery. A CDN can serve cached images close to users, an application cache can reduce repeated database queries, and a database read replica can handle read queries without sending all of them to the primary database. Uploads and other changes still need reliable writes to the primary database and object storage.

## 4. Where Should Photos Be Stored?

Photo files should be stored in object storage rather than directly inside the relational database. Photos are large binary files, and storing them in the database would increase database size, backups, and the cost of serving files. Object storage is designed for large files and can scale independently of the application database.

The database should store photo metadata, such as the photo ID, owner ID, caption, object-storage key, thumbnail key, and upload timestamp. The actual original photo and thumbnail should live in object storage, with a CDN delivering them efficiently to users.

## 5. Architecture Diagram

```text
                         USERS
                           |
                           v
                    +-------------+
                    |     CDN     |
                    | Cached      |
                    | images      |
                    +-------------+
                           |
                 Uncached requests
                           |
                           v
                  +-----------------+
                  | Load Balancer   |
                  +-----------------+
                           |
                           v
                  +-----------------+
                  | App Servers     |
                  | API and feed    |
                  | endpoints       |
                  +-----------------+
                    |      |      |
          +---------+      |      +-------------------+
          |                |                          |
          v                v                          v
    +------------+  +---------------+        +----------------+
    | Cache      |  | Primary DB    |        | Object Storage |
    | Feed data  |  | Metadata and  |        | Original photos|
    | and lookups|  | write queries |        | and thumbnails |
    +------------+  +---------------+        +----------------+
                           |
                           v
                    +---------------+
                    | Read Replica  |
                    | Read queries  |
                    +---------------+

  Upload processing:

  App Servers
      |
      v
  Object Storage
      |
      | Upload event / job
      v
  +-----------------+
  | Message Queue   |
  +-----------------+
      |
      v
  +-----------------+
  | Thumbnail Worker|
  +-----------------+
      |
      v
  +-----------------+
  | Object Storage  |
  | Save thumbnail  |
  +-----------------+

  The CDN serves cached photo files from object storage.
  The app servers use the cache and database to build feeds.
```

## 6. What Each Component Solves

- **CDN:** Delivers cached photos and thumbnails from locations closer to users, reducing latency and load on the origin storage.
- **Load balancer:** Distributes incoming API requests across healthy app servers so that one server does not handle all the traffic.
- **App servers:** Handle authentication, upload authorization, feed generation, metadata updates, and other application logic.
- **Cache:** Stores frequently requested feed data and metadata temporarily to reduce repeated database queries and improve response times.
- **Primary database:** Stores authoritative records such as users, follows, photo metadata, and upload status, and handles writes.
- **Database read replica:** Handles suitable read queries to reduce read pressure on the primary database.
- **Object storage:** Stores original photos and thumbnails durably without filling the relational database with large files.
- **Message queue:** Holds thumbnail-generation jobs so that uploads do not have to wait for image processing to finish.
- **Thumbnail worker:** Processes queued jobs, generates smaller versions of photos, and saves thumbnails to object storage.

## 7. Step-by-Step Photo Upload Flow

1. A user signs in and selects a photo to upload.
2. The app server authenticates the user, checks upload permissions, and validates the request.
3. The server creates a photo record or pending-upload record in the primary database.
4. The server provides an authorized upload URL, such as a short-lived signed URL, so the client can upload the photo directly to object storage.
5. The client uploads the original photo to object storage using that URL.
6. Once the upload succeeds, the application confirms the upload and records the photo's storage key and status in the primary database. The upload-completion step must be verified rather than trusting an unverified client message.
7. A thumbnail-generation job is placed on the message queue.
8. A thumbnail worker retrieves the job, reads the original photo from object storage, and creates a 50 KB thumbnail.
9. The worker saves the thumbnail to object storage and updates the photo record to indicate that thumbnail processing is complete.
10. The photo becomes available in the feed according to the application's publication rules, and the CDN can cache the original and thumbnail for subsequent requests.

If thumbnail processing fails, the queue can retry the job and the application can keep the photo in a pending-processing state until the thumbnail is ready or a failure is reported.

## 8. Trade-Offs

### Trade-Off 1: CDN Caching vs. Freshness

A CDN reduces image delivery latency and origin traffic, but cached content may not update immediately when a photo is deleted or access permissions change. The system needs cache expiration, invalidation, or versioned URLs and must enforce privacy rules so private photos are not accidentally exposed through shared caching.

### Trade-Off 2: Database Read Replicas vs. Consistency

Read replicas improve read capacity, but replication can lag behind the primary database. A user may briefly see stale feed metadata or not immediately see a newly uploaded photo. The application can route critical read-after-write requests to the primary database while using replicas for less time-sensitive reads.

### Trade-Off 3: Asynchronous Thumbnails vs. Immediate Availability

A queue and worker keep uploads responsive because thumbnail processing happens in the background. However, a photo's thumbnail may not be available immediately, and jobs can fail or build up during high traffic. Monitoring queue depth, retrying failed jobs, and showing a temporary placeholder help manage this trade-off.

### Trade-Off 4: Direct Object Uploads vs. Simpler Server-Controlled Uploads

Direct uploads reduce app-server bandwidth and CPU usage, but signed URLs, upload verification, permissions, and incomplete-upload cleanup add complexity. This approach is worthwhile when photo volume is high, while a smaller application may initially choose simpler server-mediated uploads.

## 9. Conclusion

SnapShare should use a horizontally scalable application tier, object storage for photo files, a CDN for image delivery, a cache and database read replica for the read-heavy feed workload, and a queue-based worker for thumbnail processing. With approximately 2,894 peak feed views per second and 748.25 TB of new photo and thumbnail storage per year, the system should scale its read path and storage independently while protecting database integrity and handling background failures reliably.
```

Save the file using `Ctrl + O`, press `Enter`, and exit using `Ctrl + X`.

## 3. Check and submit

### Verify the file exists

Run:

```bash
cd ~/workspace/web-foundations-days

ls -l day7/
cat day7/photo-app-scaling.md
```

Review the document and make sure the architecture diagram is readable.

### Commit and push

Run the required Git commands:

```bash
git add day7/photo-app-scaling.md
git commit -m "Day 7 assignment"
git push
```

Verify the commit:

```bash
git log -1 --oneline
git status
```

The latest commit should show `Day 7 assignment`, and your working tree should be clean.

## Final checklist

{@body const requirements = ["Assumptions and daily active user calculation included.","Average and peak uploads and feed views calculated.","Annual original photo and thumbnail storage calculated.","Read-heavy design explained.","Architecture diagram includes all required components.","Each component's purpose explained.","Upload and thumbnail-processing flow documented.","At least two trade-offs explained.","File committed and pushed to GitHub."]}
{@body const [completed, setCompleted] = DIL.useState([])}
<box border radius="lg" padding={3} gap={3}>
  {#each requirements as requirement, i}
    <checkbox key={requirement} checked={completed.includes(i)} onChange={v => setCompleted(old => v ? [...old, i] : old.filter(n => n !== i))}>{requirement}</checkbox>
  {/each}
  <divider color="subtle"/>
  <text color="secondary" size="sm">{completed.length} of {requirements.length} requirements checked</text>
</box>

