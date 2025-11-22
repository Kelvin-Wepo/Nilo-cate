# Ranger Dashboard - Quick Reference Guide

## 🚀 Quick Start

**Access Dashboard:** `http://localhost:3000/ranger-dashboard`

**Login:** Use your ranger credentials

**Enable Notifications:** Click "Allow" when browser asks for notification permission

---

## 📊 Dashboard Overview

### Stats at a Glance (Top of Page)

| Card | Meaning | Action |
|------|---------|--------|
| 📝 Pending Reports | User-submitted tree reports awaiting verification | Go to Reports tab |
| 🚨 Critical Alerts | Urgent issues requiring immediate attention | Go to Real-time Alerts tab |
| ⚠️ Active Alerts | All unresolved alerts across severity levels | Go to Real-time Alerts tab |
| 🌳 Pending Adoptions | Tree adoption requests awaiting approval | Go to Adoptions tab |
| 📍 Open Incidents | Forest incidents requiring investigation | Go to Incidents tab |

---

## 🔍 Tab-by-Tab Guide

### 1️⃣ Overview Tab (Home)

**What You See:**
- Quick statistics summary
- Critical alert warnings (red banner)
- Health status percentages

**What to Do:**
- ✅ Check for red warning banners daily
- ✅ Review critical alerts first
- ✅ Monitor tree health trends

---

### 2️⃣ Reports Tab

**Purpose:** Review tree health reports submitted by community members

**Actions Available:**

| Button | Function | When to Use |
|--------|----------|-------------|
| ✓ Verify | Mark report as verified | After confirming report is accurate |
| 🤖 Analyze with AI | Check for plant diseases using AI | When report has images and symptoms |
| 👁️ View | See full report details | To review images, notes, location |

**Workflow:**
1. Click on report to see details
2. Review images and description
3. If report has plant images → Click "Analyze with AI"
4. After verification → Click "Verify"
5. AI results appear in AI Analysis tab

**Color Codes:**
- 🟡 Yellow badge = Pending
- 🟢 Green badge = Verified
- 🔴 Red badge = Rejected

---

### 3️⃣ Real-time Alerts Tab ⚠️

**Purpose:** Monitor and respond to urgent tree threats

**Auto-Refresh:** Updates every 30 seconds automatically

**Severity Levels:**

| Level | Color | Badge | Response Time |
|-------|-------|-------|---------------|
| 🔴 Critical | Red | CRITICAL | Immediate (< 1 hour) |
| 🟠 High | Orange | HIGH | Urgent (< 4 hours) |
| 🟡 Medium | Yellow | MEDIUM | Same day |
| 🟢 Low | Green | LOW | Within 48 hours |

**Filter Buttons:** Click to view only specific severity levels

**Resolve Alert:**
1. Review alert details (tree ID, location, message)
2. Take necessary action in field
3. Click "Resolve" button
4. Alert marked as resolved with your name and timestamp

**Browser Notifications:**
- You'll receive pop-up notifications for Critical and High alerts
- Even if dashboard is in background tab
- Click notification to return to dashboard

---

### 4️⃣ Adoptions Tab 🌳

**Purpose:** Approve or reject tree adoption applications

**Information Shown:**
- Tree ID and name
- Adopter name and email
- Location
- Submission date

**Actions:**

| Button | Result | Next Steps |
|--------|--------|------------|
| ✅ Approve | Adoption confirmed | Adopter receives confirmation email |
| ❌ Reject | Adoption denied | Adopter receives rejection notice |

**Decision Criteria:**
- ✓ Adopter details complete and valid
- ✓ Tree available and healthy
- ✓ No conflicting adoptions
- ✗ Incomplete information
- ✗ Tree already adopted
- ✗ Suspicious request

---

### 5️⃣ Incidents Tab 📍

**Purpose:** Manage forest incident reports (illegal logging, fires, poaching, etc.)

**Incident Types:**
- 🪓 Illegal Logging
- 🔥 Forest Fire
- 🦌 Wildlife Poaching
- 🏘️ Land Encroachment
- ☣️ Environmental Pollution
- 🔨 Vandalism
- ❓ Other Incident

**Workflow:**

**Step 1: Assignment**
- Review unassigned incidents
- Click "Assign to Me" to take ownership
- Status changes to "Under Investigation"

**Step 2: Investigation**
- View GPS coordinates (click to open map)
- Review images and description
- Visit incident location
- Document findings

**Step 3: Resolution**
- Click "Resolve" button
- Enter resolution notes:
  - Actions taken
  - Evidence collected
  - Parties involved
  - Outcome
- Submit resolution

**Status Indicators:**
- 🟡 Pending = Unassigned
- 🔵 Investigating = Assigned, in progress
- 🟢 Resolved = Completed
- 🔴 Escalated = Requires higher authority

---

### 6️⃣ AI Analysis Tab 🤖

**Purpose:** View AI-powered plant disease detection results

**Information Displayed:**

| Column | Explanation |
|--------|-------------|
| Tree ID | Unique identifier of analyzed tree |
| Disease | Detected disease name (e.g., "Leaf Rust") |
| Confidence | AI's certainty level (0-100%) |
| Severity | Impact level (Low/Medium/High/Critical) |
| Analyzed At | Date and time of analysis |

**Confidence Score Guide:**

| Range | Badge Color | Meaning |
|-------|-------------|---------|
| 80-100% | 🟢 Green | High confidence - Trust result |
| 50-79% | 🟡 Yellow | Medium confidence - Verify in field |
| 0-49% | 🔴 Red | Low confidence - Requires expert inspection |

**Recommendations:**
- Click on analysis to see AI recommendations
- Follow treatment steps provided
- If critical, automatic alert created
- Track treatment progress

**When to Use AI Analysis:**
- 📷 Report has clear plant images
- 🍃 Visible symptoms (discoloration, spots, wilting)
- 🔍 Uncertain about disease type
- ⚡ Need quick preliminary diagnosis

**When NOT to Use:**
- ❌ No images in report
- ❌ Images too blurry
- ❌ Non-plant issues (pests, vandalism)
- ❌ Already know the disease

---

## 🔔 Notification System

### You'll Receive Notifications Via:

**1. Browser Notifications (Pop-ups)**
- Critical and High alerts only
- Appears even in background tabs
- Click to open dashboard

**2. SMS Text Messages**
- Critical alerts only
- Sent to your registered phone number
- Includes tree ID, location, alert type

**3. Email**
- All severity levels
- Detailed alert information
- Sent to your registered email address

**4. Dashboard Badge**
- Red badge on browser tab
- Shows count of new critical alerts

### Notification Settings:

**Enable Browser Notifications:**
1. Click browser notification prompt "Allow"
2. Or go to browser settings → Site settings → Notifications
3. Find dashboard URL and set to "Allow"

**Update Phone Number:**
1. Contact system administrator
2. Provide phone in format: +254XXXXXXXXX
3. Verify SMS receipt

**Update Email:**
1. Login to user profile
2. Update email address
3. Verify email receipt

---

## ⚡ Quick Actions

### Responding to Critical Alert

**Immediate Actions (< 5 minutes):**
1. Read alert details carefully
2. Note tree ID and GPS coordinates
3. Check for images/evidence
4. Determine required resources (tools, team, transport)

**Field Response (< 1 hour):**
1. Travel to location
2. Assess situation in person
3. Take photos/videos
4. Implement emergency measures

**Dashboard Update (Same day):**
1. Return to dashboard
2. Navigate to Real-time Alerts tab
3. Click "Resolve" on the alert
4. Document actions taken
5. Upload field photos if available

### Daily Routine Checklist

**Morning (8:00 AM):**
- [ ] Login to dashboard
- [ ] Check Overview for critical alerts
- [ ] Review new reports (Reports tab)
- [ ] Assign incidents to yourself (Incidents tab)
- [ ] Approve pending adoptions (Adoptions tab)

**During Day:**
- [ ] Respond to critical alerts immediately
- [ ] Conduct field investigations for assigned incidents
- [ ] Verify reports after field visits
- [ ] Resolve alerts after completing actions

**Evening (5:00 PM):**
- [ ] Update incident statuses
- [ ] Resolve completed alerts
- [ ] Document day's activities
- [ ] Review AI analysis results
- [ ] Plan next day's priorities

---

## 🛠️ Troubleshooting

### Common Issues

**Problem:** Dashboard not loading
- **Solution:** Refresh page (Ctrl+R or Cmd+R)
- **Solution:** Clear browser cache
- **Solution:** Check internet connection
- **Solution:** Contact IT support

**Problem:** Alerts not refreshing
- **Solution:** Check if auto-refresh is working (look for refresh indicator)
- **Solution:** Manually refresh by switching tabs
- **Solution:** Logout and login again

**Problem:** AI analysis fails
- **Solution:** Check if report has images
- **Solution:** Verify image format (JPEG/PNG only)
- **Solution:** Try again in a few minutes (API rate limit)
- **Solution:** Report to IT if persistent

**Problem:** Notifications not appearing
- **Solution:** Check browser notification permissions
- **Solution:** Verify phone number/email in profile
- **Solution:** Check spam folder for emails
- **Solution:** Contact IT to verify notification settings

**Problem:** Can't verify/resolve items
- **Solution:** Verify you're logged in as ranger
- **Solution:** Check internet connection
- **Solution:** Refresh page and try again
- **Solution:** Contact IT if error persists

---

## 📱 Mobile Usage

**Accessing on Mobile:**
- Dashboard is responsive and works on phones/tablets
- Use Chrome, Firefox, or Safari
- Landscape mode recommended for better view

**Mobile Limitations:**
- Browser notifications may not work on iOS Safari
- GPS navigation may require map app
- Image uploads may be slower on mobile data

**Best Practices:**
- Use WiFi for AI analysis (faster, no data charges)
- Download offline map apps for field work
- Take photos with phone, upload when back at base

---

## 🆘 Emergency Contacts

**Critical Incident (Life-threatening):**
- 📞 Emergency Services: [Number]
- 🚨 Police: [Number]
- 🚑 Medical: [Number]

**Forest Fires:**
- 🔥 Fire Department: [Number]
- 🌳 Forest Service: [Number]

**Wildlife Issues:**
- 🦁 Kenya Wildlife Service: [Number]

**Technical Support:**
- 💻 IT Helpdesk: [Number]
- 📧 Email: support@nilocate.com

**Management:**
- 👔 Supervisor: [Name] - [Number]
- 🏢 Headquarters: [Number]

---

## 📚 Additional Resources

**Training Materials:**
- Video tutorials: [URL]
- User manual (full): [URL]
- FAQ: [URL]

**Standard Operating Procedures:**
- SOP for critical alerts: [Document]
- SOP for incident investigation: [Document]
- SOP for adoption approvals: [Document]

**Forms & Templates:**
- Incident report form: [URL]
- Field assessment checklist: [URL]
- Resolution documentation template: [URL]

---

## 💡 Pro Tips

**Efficiency Hacks:**

1. **Use Keyboard Shortcuts**
   - Tab = Switch between tabs
   - Ctrl/Cmd + R = Refresh page
   - Esc = Close modals

2. **Filter Smart**
   - Start each day viewing "Critical" alerts only
   - Then work through "High" alerts
   - Handle lower priorities during slower periods

3. **Batch Actions**
   - Verify multiple reports at once during field visits
   - Resolve several alerts in same area together
   - Approve adoptions in batches to save time

4. **Document Well**
   - Take photos for every incident
   - Write detailed resolution notes
   - Future rangers will thank you

5. **Stay Organized**
   - Prioritize by severity, then by location
   - Group nearby incidents for efficient field visits
   - Use notes app to track ongoing investigations

**Common Mistakes to Avoid:**

- ❌ Ignoring medium/low alerts (they can escalate)
- ❌ Resolving alerts without field verification
- ❌ Not documenting resolution actions
- ❌ Forgetting to update incident status
- ❌ Ignoring AI analysis recommendations

**Best Practices:**

- ✅ Check dashboard at start and end of shift
- ✅ Respond to critical alerts within 1 hour
- ✅ Always verify reports before AI analysis
- ✅ Document everything with photos
- ✅ Coordinate with team on major incidents
- ✅ Update phone/email if changed
- ✅ Report technical issues immediately

---

## 📊 Performance Metrics

**Your Performance is Tracked:**
- Average response time to alerts
- Number of incidents resolved
- Reports verified
- AI analyses triggered
- Adoptions processed

**Target KPIs:**
- Critical alert response time: < 1 hour
- High alert response time: < 4 hours
- Incident resolution time: < 3 days
- Report verification rate: > 80%
- Alert resolution rate: > 90%

---

## 🎯 Quick Decision Matrix

### When You See a Critical Alert:

| Scenario | Priority | Action |
|----------|----------|--------|
| Forest fire | 🔴 P0 | Call fire dept, evacuate, respond |
| Illegal logging in progress | 🔴 P0 | Call police, secure evidence, respond |
| Diseased tree outbreak | 🟠 P1 | AI analysis, quarantine area, treat |
| Vandalism/theft | 🟠 P1 | Document, report police, secure site |
| Wildlife conflict | 🟡 P2 | Call KWS, assess danger, respond safely |

**Priority Levels:**
- P0 = Drop everything, respond immediately
- P1 = Respond within 4 hours
- P2 = Respond same day

---

## ✅ End of Shift Checklist

Before logging out:

- [ ] All critical alerts addressed or assigned
- [ ] Pending reports verified
- [ ] Incidents updated with latest status
- [ ] AI analyses reviewed
- [ ] Adoptions processed
- [ ] Resolution notes documented
- [ ] Field photos uploaded
- [ ] Handover notes for next shift (if applicable)
- [ ] Dashboard left in Overview tab

---

**Remember:** You're the guardian of our forests. Every alert you respond to, every report you verify, every incident you investigate makes a difference. Stay vigilant, stay safe, and protect our natural heritage! 🌳🌍

---

*For full documentation, see: `/docs/RANGER_DASHBOARD_IMPLEMENTATION.md`*

*Questions? Contact IT Support: support@nilocate.com*

*Emergency? Call: [Emergency Number]*

---

**Version:** 1.0.0  
**Last Updated:** December 2024  
**Status:** Active
