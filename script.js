function getPageName() {
    return location.pathname.split("/").pop() || "index.html";
}
/* ================= USER ID ================= */
async function getUserId() {
    let id = localStorage.getItem("userId");
    if (id) return id;

    const res = await fetch("/api/user/register", { method: "POST" });
    const data = await res.json();

    localStorage.setItem("userId", data.userId);
    return data.userId;
}

/* =========Helper function=======*/
async function apiFetch(url, options = {}) {
    const userId = await getUserId();

    return fetch(url, {
        ...options,
        headers: {
            ...(options.headers || {}),
            "X-User-Id": userId
        }
    });
}

/* ================= SLIDER LOGIC ================= */

let slides = [];
let currentIndex = 0;
let slideInterval = null;

const slideImage = document.getElementById("slideImage");
const slideLink = document.getElementById("slideLink");
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");

function renderSlide(index) {
    if (!slides.length) return;

    slideImage.style.opacity = 0;
    setTimeout(() => {
        slideImage.src = slides[index].image;
        slideLink.href = slides[index].link;
        slideImage.style.opacity = 1;
    }, 300);
}

function nextSlide() {
    currentIndex = (currentIndex + 1) % slides.length;
    renderSlide(currentIndex);
    resetAutoSlide();
}

function prevSlide() {
    currentIndex = (currentIndex - 1 + slides.length) % slides.length;
    renderSlide(currentIndex);
    resetAutoSlide();
}

function startAutoSlide() {
    slideInterval = setInterval(nextSlide, 8000);
}

function resetAutoSlide() {
    clearInterval(slideInterval);
    startAutoSlide();
}

async function loadSlides() {
    if (!slideImage) return;

    try {
        const res = await fetch("/api/slides", {
            headers: { "X-User-Id": getUserId() }
        });
        slides = await res.json();

        if (slides.length) {
            renderSlide(0);
            startAutoSlide();
        }
    } catch (err) {
        console.error("Slide load failed", err);
    }
}

/* ================= PROFESSOR DATA ================= */

async function loadProfessor() {
    try {
        const res = await fetch("/api/professor", {
            headers: { "X-User-Id": getUserId() }
        });
        const data = await res.json();

        document.querySelectorAll(".prof-name")
            .forEach(el => el.textContent = data.name);

        document.querySelectorAll(".prof-position")
            .forEach(el => el.textContent = data.position);

        const photo = document.getElementById("profilePhoto");
        const bio = document.getElementById("bio");

        if (photo) photo.src = data.photo;
        if (bio) bio.textContent = data.bio;

        if (document.getElementById("email")) {
            document.getElementById("email").textContent = data.contact.email;
            document.getElementById("phone").textContent = data.contact.phone;
            document.getElementById("address").textContent = data.contact.address;
            document.getElementById("linkedin").href = data.contact.social.linkedin;
            document.getElementById("youtube").href = data.contact.social.youtube;
        }
    } catch (err) {
        console.error("Professor load failed", err);
    }
}

/* ================= HOME RECOMMENDATIONS ================= */

async function loadHomeRecommendations() {
    const newList = document.getElementById("newContent");
    const popularList = document.getElementById("popularContent");
    const userCount = document.getElementById("userCount");

    if (!newList || !popularList) return;

    try {
        const res = await apiFetch("/api/home");
        const data = await res.json();

        userCount.textContent =
            `👥 ${data.totalUsers} users have visited this site`;

        newList.innerHTML = "";
        popularList.innerHTML = "";

        data.newForYou.forEach(title => {
            const li = document.createElement("li");
            li.textContent = title;
            newList.appendChild(li);
        });

        data.popularCourses.forEach(title => {
            const li = document.createElement("li");
            li.textContent = title;
            popularList.appendChild(li);
        });
    } catch (err) {
        console.error("Home recommendations failed", err);
    }
}

/* ================= ADMIN DASHBOARD ================= */

async function loadAdminStats() {
    const totalUsersEl = document.getElementById("totalUsers");
    if (!totalUsersEl) return; // ✅ Not admin page

    const token = localStorage.getItem("adminToken");
    if (!token) return;

    const res = await fetch("/api/admin/stats", {
        headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) return; // ✅ 401 / 403 protection

    const data = await res.json();

    if (!data || !data.perPage || !data.perDay) return; // ✅ Data safety

    totalUsersEl.textContent = data.totalUsers ?? 0;
    document.getElementById("totalVisits").textContent = data.totalVisits ?? 0;

    /* ===== MOST VISITED PAGE ===== */
    let topPage = "", max = 0;
    for (const page in data.perPage) {
        if (data.perPage[page] > max) {
            max = data.perPage[page];
            topPage = page;
        }
    }

    document.getElementById("topPage").textContent =
        topPage ? `${topPage} (${max} visits)` : "—";

    /* ===== TABLE ===== */
    const table = document.getElementById("visitsTable");
    if (!table) return;

    table.innerHTML = "";
    for (const page in data.perPage) {
        table.innerHTML +=
            `<tr><td>${page}</td><td>${data.perPage[page]}</td></tr>`;
    }

    /* ===== CHARTS (guarded) ===== */
    const pageChartEl = document.getElementById("pageChart");
    const dailyChartEl = document.getElementById("dailyChart");

    if (pageChartEl) {
        new Chart(pageChartEl, {
            type: "bar",
            data: {
                labels: Object.keys(data.perPage),
                datasets: [{ label: "Visits", data: Object.values(data.perPage) }]
            }
        });
    }

    if (dailyChartEl) {
        new Chart(dailyChartEl, {
            type: "line",
            data: {
                labels: Object.keys(data.perDay),
                datasets: [{ label: "Daily Visits", data: Object.values(data.perDay) }]
            }
        });
    }
}

async function loadAdminCourses() {
    const list = document.getElementById("coursesList");
    if (!list) return;   // ✅ VERY IMPORTANT

    const token = localStorage.getItem("adminToken");
    if (!token) return;

    const res = await fetch("/api/admin/courses", {
        headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) return;

    const courses = await res.json();

    list.innerHTML = "";
    courses.forEach(course => {
        const li = document.createElement("li");
        li.textContent = `${course.title} (${course.category})`;
        list.appendChild(li);
    });
}

async function addCourse() {
    const titleInput = document.getElementById("courseTitle");
    const categoryInput = document.getElementById("courseCategory");
    const youtubeInput = document.getElementById("courseYoutube");

    if (!titleInput || !categoryInput) return;

    const title = titleInput.value.trim();
    const category = categoryInput.value.trim();
    const youtube = youtubeInput ? youtubeInput.value.trim() : "";

    if (!title || !category) {
        alert("Title and Category are required");
        return;
    }

    const token = localStorage.getItem("adminToken");
    if (!token) return;

    await fetch("/api/admin/courses", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title, category, youtube })
    });

    titleInput.value = "";
    categoryInput.value = "";
    if (youtubeInput) youtubeInput.value = "";

    loadAdminCourses();
}

async function deleteCourse(id) {
    const token = localStorage.getItem("adminToken");

    await fetch(`/api/admin/courses/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
    });

    loadAdminCourses();
}

/* ================= COURSES PAGE ================= */
/* ================= COURSES PAGE ================= */

async function loadCourses() {
    const container = document.getElementById("coursesContainer");
    if (!container) return;

    try {
        const res = await fetch("/api/courses", {
            headers: { "X-User-Id": getUserId() }
        });

        const courses = await res.json();
        container.innerHTML = "";

        if (!Array.isArray(courses) || courses.length === 0) {
            container.innerHTML = "<p>No courses available yet.</p>";
            return;
        }

        courses.forEach(course => {
            const section = document.createElement("section");
            section.className = "course-section";

            const videos = Array.isArray(course.videos) ? course.videos : [];
            const preview = videos.slice(0, 4);
            const remaining = videos.slice(4);

            section.innerHTML = `
                <h3 class="course-title">${course.title}</h3>
                <p class="course-desc">${course.description || ""}</p>

                <div class="course-preview">
                    ${preview.map(video => `
                        <div class="video-card">
                            <a href="${video.url}" target="_blank">
                                <img src="${video.thumbnail}" alt="${video.title}">
                                <span>${video.title}</span>
                            </a>
                        </div>
                    `).join("")}
                </div>

                ${remaining.length > 0 ? `
                    <button class="btn show-more-btn" data-id="${course.id}">
                        Show more
                    </button>
                    <div class="course-expanded hidden" id="expanded-${course.id}">
                        ${remaining.map(video => `
                            <div class="video-card">
                                <a href="${video.url}" target="_blank">
                                    <img src="${video.thumbnail}" alt="${video.title}">
                                    <span>${video.title}</span>
                                </a>
                            </div>
                        `).join("")}
                    </div>
                ` : ""}
            `;

            container.appendChild(section);
        });

        // Show More toggle
        container.addEventListener("click", e => {
            if (!e.target.classList.contains("show-more-btn")) return;

            const id = e.target.dataset.id;
            const expanded = document.getElementById(`expanded-${id}`);

            expanded.classList.toggle("hidden");
            e.target.textContent =
                expanded.classList.contains("hidden") ? "Show more" : "Show less";
        });

    } catch (err) {
        console.error("Failed to load courses", err);
        container.innerHTML = "<p>Error loading courses.</p>";
    }
}

/*====courses====*/

function trackCourseView(el) {
    const courseId = el.dataset.id;
    if (!courseId) return;

    fetch(`/api/courses/view/${courseId}`, {
        method: "POST",
        headers: {
            "X-User-Id": getUserId()
        }
    });
}
function trackPageVisit() {
    fetch("/api/track-page", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-User-Id": getUserId()
        },
        body: JSON.stringify({
            page: getPageName()
        })
    });
}
/*========== Reab Contact submit logic ======*/
async function setupContactForm() {
    const form = document.getElementById("contactForm");
    if (!form) return;

    form.addEventListener("submit", async e => {
        e.preventDefault();

        const payload = {
            name: document.getElementById("name").value,
            email: document.getElementById("emailInput").value,
            message: document.getElementById("message").value
        };

        try {
            const res = await apiFetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error("Failed");

            document.getElementById("formStatus").textContent =
                "Message sent successfully ✅";
            form.reset();
        } catch (err) {
            document.getElementById("formStatus").textContent =
                "Failed to send message ❌";
        }
    });
}

/* ================= INIT ================= */
document.addEventListener("DOMContentLoaded", () => {
    // Ensure user exists
    getUserId();
    trackPageVisit();

const page = getPageName();

if (page === "index.html") {
    loadSlides();
    loadHomeRecommendations();
}

if (page === "courses.html") {
    loadCourses();
}

if (page === "admin.html") {
    loadAdminCourses();
    loadAdminStats();
}
    loadProfessor();
    setupContactForm();


    // Slider controls
    if (nextBtn) nextBtn.addEventListener("click", nextSlide);
    if (prevBtn) prevBtn.addEventListener("click", prevSlide);

	    const links = document.querySelectorAll(".nav a");
    //const current = location.pathname.split("/").pop() || "index.html";
const current = page;
    links.forEach(link => {
        if (link.getAttribute("href") === current) {
            link.classList.add("active");
        }
    });
});
// ================= COURSE CLICK TRACKING =================
// Delegated listener for dynamically loaded course videos
document.addEventListener("click", (e) => {
    const videoLink = e.target.closest(".video-card a");
    if (!videoLink) return;

    const courseSection = videoLink.closest(".course-section");
    if (!courseSection) return;

    const titleEl = courseSection.querySelector(".course-title");
    if (!titleEl) return;

    const courseTitle = titleEl.textContent.trim();

    fetch(`/api/courses/view/${encodeURIComponent(courseTitle)}`, {
        method: "POST",
        headers: {
            "X-User-Id": getUserId()
        }
    }).catch(err => {
        console.error("Course view tracking failed", err);
    });
});

