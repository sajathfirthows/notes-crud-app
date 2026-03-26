# Screen Recording Script (15–20 minutes)

Use this script to guide your recording. Speak naturally — don't read verbatim.

---

## Section 1: Local Demo (5–6 minutes)

**[0:00] Introduction**
> "Hi, I'm [Name]. This is my submission for the Associate Cloud Engineer assessment.
> I've built NoteVault — a full-stack CRUD app with Django, React, PostgreSQL,
> containerised with Docker and deployed on AWS. Let me walk you through it."

**[0:30] Show project structure**
- Open VS Code / file explorer
- Highlight: backend/, frontend/, nginx/, docker-compose.yml, .env.example
- Mention: "No secrets hardcoded — all via environment variables"

**[1:30] Start local environment**
```bash
docker compose -f docker-compose.dev.yml up --build
```
- Show containers starting in terminal
- Show `docker compose ps` — all 4 containers healthy

**[2:30] Demo the CRUD app**
- Open http://localhost in browser
- CREATE: Add a new note with title + description + file attachment
- READ: Show the note appears in the list
- UPDATE: Click Edit → change title → save
- DELETE: Delete a note → confirm it disappears

**[4:00] Show API directly**
- Open http://localhost/api/notes/ in browser
- Show JSON response
- "This is the Django REST Framework browsable API"

**[5:00] S3 upload demo**
- Use the S3 upload panel on the frontend
- Show the returned S3 URL
- Optionally: open AWS console → S3 → show file uploaded

---

## Section 2: Docker Deep Dive (3–4 minutes)

**[6:00] Show Dockerfiles**
- backend/Dockerfile: "Multi-stage build — builder stage, then slim runtime"
- frontend/Dockerfile: "Build React, serve via Nginx"

**[6:45] Show docker-compose.yml**
- Highlight: postgres service has NO ports exposed
- Show: internal network — services talk by name
- Show: volumes for data persistence

**[7:30] Show nginx config**
- nginx/nginx.conf: "Nginx is the only container with ports 80/443"
- Show proxy_pass rules: /api/ → backend, /* → frontend

**[8:00] Show entrypoint.sh**
- "Waits for DB, runs migrations, then starts Gunicorn — startup ordering sorted"

---

## Section 3: AWS Deployment (5–6 minutes)

**[9:00] Show EC2 instance**
- AWS Console → EC2 → Running instances
- Show: t2.micro, Ubuntu, public IP

**[9:30] Show Security Group**
- Click on security group
- Show: only ports 22 (your IP), 80, 443 are open
- "Port 5432 and 8000 are NOT open — database never exposed"

**[10:00] SSH into EC2**
```bash
ssh -i "your-key.pem" ubuntu@YOUR_IP
cd notes-crud-aws
docker compose ps
```
- Show all 4 containers running on EC2

**[11:00] Show live application**
- Open browser → https://your-domain.com
- Show the padlock (SSL working)
- Demo CRUD operations on live EC2 deployment

**[12:00] Show S3 bucket**
- AWS Console → S3 → your bucket
- Show uploaded files
- Show bucket policy (no public access)

**[12:30] Show IAM user**
- AWS Console → IAM → Users → notes-app-s3
- Show the inline policy
- "This user can ONLY access this specific bucket — least privilege principle"

---

## Section 4: Architecture Explanation (2–3 minutes)

**[13:30] Open architecture diagram**
- Open docs/architecture-diagram.html
- Walk through: "Internet hits Security Group, only 80/443 allowed"
- "Nginx is the single entry point — routes /api to Django, /* to React"
- "PostgreSQL is completely internal — zero public exposure"
- "Files go to S3 via least-privilege IAM credentials from environment variables"

**[15:00] Scaling discussion**
> "If I were to scale this: I'd move to ECS Fargate for managed containers,
> put an Application Load Balancer in front, migrate PostgreSQL to RDS Multi-AZ
> for automatic failover, and add CloudFront in front of S3 for global edge caching.
> The application is stateless so horizontal scaling is straightforward."

**[16:00] Security summary**
> "Three key security decisions: one — database never exposed publicly,
> two — secrets only via environment variables, three — IAM follows least privilege.
> The Security Group is the perimeter, Nginx is the only ingress point."

**[17:00] Close**
> "That's the full deployment — CRUD app working, Docker containerised,
> deployed on AWS EC2 with SSL, S3 for file storage, and least-privilege IAM.
> Thanks for reviewing."

---

## Recording Tips

- Use OBS Studio (free) or Windows Game Bar (Win+G) for recording
- Record at 1080p minimum
- Keep terminal font large (14pt+) so text is readable
- Have AWS Console already logged in before recording
- Do a dry run first — you'll be more natural second time
