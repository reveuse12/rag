# 🚀 CityCircle: 7-Day Build In Public Campaign

Organic, founder-led social strategy for X (Twitter) documenting the creation, engineering, and launch of CityCircle.

---

### 📍 MONDAY: The Launch & Core Idea
*(Attach a 15–20s clean screen recording clicking around the map, exploring circles, and opening a chat)*

> Built a small side project for my city this week: **CityCircle**.
>
> Every time I tried joining local groups on WhatsApp or Telegram, it turned into spam within days. And apps like Nextdoor feel bloated.
>
> Wanted something simple:
> • A map where you click anywhere to host a quick coffee or cycling meetup  
> • WhatsApp-style group controls (member caps + admin approval so groups don't get messy)  
> • Location fuzzing so your exact home GPS is never visible  
> • A live tab pulling top conversations from r/surat & Instagram  
>
> Built with Next.js 16 and deployed on Vercel:  
> https://citycircle-surat.vercel.app  
>
> Would love your honest thoughts or feedback on what feels clunky.

---

### 📍 TUESDAY: Engineering Location Privacy (Spatial Jitter)
*(Attach screenshot of fuzzy translucent circle map zones)*

> Small UX problem I ran into while building the live map:
>
> People like seeing active meetups and neighbors nearby, but nobody wants their exact building pin floating on a public map.
>
> Instead of storing raw GPS coordinates, I added a simple spatial jitter (400m–1km radius).
>
> The map renders a soft translucent area instead of a precise point. You know someone is in Vesu or Piplod, but their home stays private.
>
> Small detail, but makes people way more comfortable using local apps.

---

### 📍 WEDNESDAY: Borrowing WhatsApp Group Mechanics
*(Attach screenshot of the WhatsApp-style Admin Approval Queue & Member Capacity Bar)*

> Realized something while testing group chats:
>
> Big, open group chats almost always die because of spam.
>
> Instead of creating complex Discord-like permission trees, I just borrowed what already works on WhatsApp:
> 1. Hard participant caps (50, 100, 256)
> 2. A pending requests queue so admins approve who joins
> 3. An "Only Admins Can Post" toggle for announcements
>
> Keeping the UI familiar meant zero learning curve for users.

---

### 📍 THURSDAY: Solving the "Cold Start" Empty Feed Problem
*(Attach screenshot of the Reddit r/surat + Instagram Reels Pulse Feed)*

> The hardest part about building any local community app is the empty feed problem on day 1.
>
> To make the app useful before hundreds of people join, I connected a simple background fetch to Reddit (`r/surat`).
>
> Now when you open the "Trends" tab, you immediately see real local discussions (food spots, metro work, weekend routes).
>
> Gives people a reason to check the app even before their friends join.

---

### 📍 FRIDAY: Interactive Map Performance & Geocoding
*(Attach short GIF clicking on a cafe pin on the map and watching the address auto-fill)*

> Switched from Google Maps to Leaflet + OpenStreetMap for the interactive map view.
>
> Saved a bunch on potential API billing, and with custom lightweight SVG markers, the map renders instantly on mobile with zero lag.
>
> You can click any landmark or cafe directly on the map to create a meetup card with auto-filled address details.

---

### 📍 SATURDAY: Micro-Details & UX Polish
*(Attach high-res dark mode UI mockup)*

> Spent today cleaning up edge cases and UI polish:
> - Added a progress bar showing when a circle is near capacity (e.g. 210/256)
> - One-click share to WhatsApp so hosts can invite their existing circle
> - Clean dark mode accents and category filters
>
> It's the subtle 1% details that make an app feel solid.

---

### 📍 SUNDAY: Week 1 Numbers & Community Feedback

> First week of building CityCircle wrapped up.
>
> Shipped the core features, cleaned up bugs, and got the first version live in production:  
> https://citycircle-surat.vercel.app  
>
> If you build consumer or local apps, what's usually your biggest blocker when getting initial traction? Let me know 👇
