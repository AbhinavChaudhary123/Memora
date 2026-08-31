import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  useNavigate,
  useLocation,
  Link,
} from "react-router-dom";
import {
  BookOpen,
  Heart,
  MapPin,
  Search,
  Bookmark,
  Plus,
  LogOut,
  UserRound,
  Compass,
  Clock3,
  MessageCircle,
  Trash2,
  Edit3,
  ArrowLeft,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import { api, setAuth, clearAuth, currentUser } from "./api";
import "./styles.css";
const fallbackImg =
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1000&q=80";
function Layout({ children }) {
  const nav = useNavigate(),
    loc = useLocation(),
    u = currentUser();
  const [open, setOpen] = useState(false);
  const logout = () => {
    clearAuth();
    nav("/login");
  };
  return (
    <>
      <header>
        <Link className="brand" to="/">
          <span>ME</span>
          <b>MORA</b>
        </Link>
        <nav className={open ? "open" : ""}>
          <Link className={loc.pathname === "/" ? "active" : ""} to="/">
            <Compass size={17} />
            Discover
          </Link>
          <Link to="/diary">
            <BookOpen size={17} />
            My Diary
          </Link>
          <Link to="/places">
            <MapPin size={17} />
            Places
          </Link>
          {u ? (
            <>
              <Link to="/create">
                <Plus size={17} />
                Create
              </Link>
              <Link to={`/profile/${u.username}`}>
                <UserRound size={17} />
                {u.username}
              </Link>
              <button className="navbtn" onClick={logout}>
                <LogOut size={17} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link className="navcta" to="/signup">
                Join
              </Link>
            </>
          )}{" "}
        </nav>
        <button className="menu" onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
      </header>
      {children}
      <footer>
        <span>MEMORA</span> · Where memories find a home.
      </footer>
    </>
  );
}
function Toast({ msg }) {
  return msg ? <div className="toast">{msg}</div> : null;
}
function Home() {
  const [stories, setStories] = useState([]),
    [q, setQ] = useState(""),
    [loading, setLoading] = useState(true);
  const load = async () => {
    setLoading(true);
    const { data } = await api.get("/stories", { params: { q } });
    setStories(data);
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, []);
  return (
    <main>
      <section className="hero">
        <div>
          <div className="eyebrow">A PLACE FOR YESTERDAY</div>
          <h1>
            Some memories
            <br />
            <i>deserve</i> another life.
          </h1>
          <p>
            Collect the stories, people and places that made you who you are. No
            algorithm. Just the good stuff.
          </p>
          <div className="hero-actions">
            <Link className="primary" to="/create">
              <Plus size={18} /> Save a memory
            </Link>
            <a className="secondary" href="#memories">
              Explore memories
            </a>
          </div>
        </div>
        <div className="hero-note">
          <Sparkles />
          <strong>Memory of the day</strong>
          <span>“The best stories usually begin with ‘remember when…’”</span>
        </div>
      </section>
      <section id="memories" className="section">
        <div className="section-head">
          <div>
            <div className="eyebrow">THE MEMORY WALL</div>
            <h2>Recent memories</h2>
          </div>
          <form
            className="search"
            onSubmit={(e) => {
              e.preventDefault();
              load();
            }}
          >
            <Search size={18} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search memories, places, tags…"
            />
          </form>
        </div>
        {loading ? (
          <div className="empty">Opening the memory box…</div>
        ) : stories.length ? (
          <div className="grid">
            {stories.map((s) => (
              <StoryCard key={s._id} s={s} />
            ))}
          </div>
        ) : (
          <div className="empty">No memories found. Try another search.</div>
        )}
      </section>
    </main>
  );
}
function StoryCard({ s, own = false, onDelete }) {
  const [liked, setLiked] = useState(false),
    [count, setCount] = useState(s.likes?.length || 0),
    [saved, setSaved] = useState(false);
  const toggle = async () => {
    if (!currentUser()) return;
    const { data } = await api.post(`/stories/${s._id}/like`);
    setLiked(data.liked);
    setCount(data.likes);
  };
  const bookmark = async () => {
    if (!currentUser()) return;
    const { data } = await api.post(`/stories/${s._id}/bookmark`);
    setSaved(data.bookmarked);
  };
  return (
    <article className="story-card">
      {s.cover ? (
        <img src={s.cover} alt="" />
      ) : (
        <div className="cover-placeholder">
          <Clock3 />
        </div>
      )}
      <div className="story-body">
        <div className="story-meta">
          <span>{s.mood || "nostalgic"}</span>
          <span>{s.year || new Date(s.createdAt).getFullYear()}</span>
        </div>
        <h3>{s.title}</h3>
        <p>{s.story}</p>
        <div className="tags">
          {(s.tags || []).slice(0, 4).map((t) => (
            <small key={t}>#{t}</small>
          ))}
        </div>
        <div className="card-foot">
          <Link to={`/profile/${s.author?.username}`} className="author">
            @{s.author?.username}
          </Link>
          <div className="actions">
            <button onClick={toggle} className={liked ? "liked" : ""}>
              <Heart size={17} fill={liked ? "currentColor" : "none"} />
              {count}
            </button>
            <button onClick={bookmark} className={saved ? "saved" : ""}>
              <Bookmark size={17} fill={saved ? "currentColor" : "none"} />
            </button>
            {own && (
              <button onClick={() => onDelete(s._id)}>
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
function Auth({ signup = false }) {
  const nav = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "" }),
    [err, setErr] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      const { data } = await api.post(
        `/auth/${signup ? "signup" : "login"}`,
        form,
      );
      setAuth(data.token, data.user);
      nav("/");
    } catch (e) {
      setErr(e.response?.data?.message || "Something went wrong");
    }
  };
  return (
    <main className="auth">
      <div className="auth-card">
        <div className="eyebrow">
          {signup ? "WELCOME TO THE CLUB" : "WELCOME BACK"}
        </div>
        <h1>
          {signup ? "Start your memory box." : "Pick up where you left off."}
        </h1>
        <p>
          {signup
            ? "A quiet corner of the internet for the things worth keeping."
            : "Your memories are waiting."}
        </p>
        <form onSubmit={submit}>
          <label>
            Username
            <input
              required
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
          </label>
          {signup && (
            <label>
              Email
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </label>
          )}{" "}
          {!signup && (
            <label>
              Email or username
              <input
                value={form.email || form.username}
                onChange={(e) =>
                  setForm({
                    ...form,
                    email: e.target.value,
                    username: e.target.value,
                  })
                }
              />
            </label>
          )}
          <label>
            Password
            <input
              type="password"
              required
              minLength="8"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </label>
          {err && <div className="error">{err}</div>}
          <button className="primary full">
            {signup ? "Create account" : "Log in"}
          </button>
        </form>
        <div className="auth-switch">
          {signup ? "Already have an account? " : "New here? "}
          <Link to={signup ? "/login" : "/signup"}>
            {signup ? "Log in" : "Create one"}
          </Link>
        </div>
      </div>
    </main>
  );
}
function Create() {
  const nav = useNavigate(),
    [type, setType] = useState("story"),
    [form, setForm] = useState({
      title: "",
      story: "",
      mood: "nostalgic",
      tags: "",
      location: "",
      year: "",
      placeName: "",
      city: "",
      state: "",
      description: "",
      bestTimeToVisit: "",
      memory: "",
    }),
    [msg, setMsg] = useState("");
  const save = async (e) => {
    e.preventDefault();
    try {
      if (type === "story")
        await api.post("/stories", {
          ...form,
          tags: form.tags
            .split(",")
            .map((x) => x.trim())
            .filter(Boolean),
          year: form.year ? Number(form.year) : undefined,
        });
      else await api.post("/places", form);
      nav(type === "story" ? "/diary" : "/places");
    } catch (e) {
      setMsg(e.response?.data?.message || "Could not save");
    }
  };
  return (
    <main className="form-page">
      <div className="page-title">
        <div>
          <div className="eyebrow">ADD TO THE ARCHIVE</div>
          <h1>Save a little piece of yesterday.</h1>
        </div>
        <Link to="/" className="icon-link">
          <ArrowLeft /> Back
        </Link>
      </div>
      <div className="tabs">
        <button
          className={type === "story" ? "selected" : ""}
          onClick={() => setType("story")}
        >
          Story
        </button>
        <button
          className={type === "place" ? "selected" : ""}
          onClick={() => setType("place")}
        >
          Place
        </button>
      </div>
      <form className="editor" onSubmit={save}>
        {type === "story" ? (
          <>
            <label>
              Title
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="The summer we stayed out too late"
              />
            </label>
            <div className="two">
              <label>
                Mood
                <select
                  value={form.mood}
                  onChange={(e) => setForm({ ...form, mood: e.target.value })}
                >
                  <option>nostalgic</option>
                  <option>joyful</option>
                  <option>bittersweet</option>
                  <option>peaceful</option>
                  <option>funny</option>
                </select>
              </label>
              <label>
                Year
                <input
                  type="number"
                  value={form.year}
                  onChange={(e) => setForm({ ...form, year: e.target.value })}
                  placeholder="2008"
                />
              </label>
            </div>
            <label>
              Story
              <textarea
                required
                rows="9"
                value={form.story}
                onChange={(e) => setForm({ ...form, story: e.target.value })}
                placeholder="Tell it exactly how you remember it…"
              />
            </label>
            <div className="two">
              <label>
                Place / city
                <input
                  value={form.location}
                  onChange={(e) =>
                    setForm({ ...form, location: e.target.value })
                  }
                />
              </label>
              <label>
                Tags
                <input
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  placeholder="school, friends, summer"
                />
              </label>
            </div>
          </>
        ) : (
          <>
            <label>
              Place name
              <input
                required
                value={form.placeName}
                onChange={(e) =>
                  setForm({ ...form, placeName: e.target.value })
                }
                placeholder="The old playground"
              />
            </label>
            <div className="two">
              <label>
                City
                <input
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
              </label>
              <label>
                State
                <input
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                />
              </label>
            </div>
            <label>
              Description
              <textarea
                required
                rows="7"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="What makes this place special?"
              />
            </label>
            <div className="two">
              <label>
                Best time to visit
                <input
                  value={form.bestTimeToVisit}
                  onChange={(e) =>
                    setForm({ ...form, bestTimeToVisit: e.target.value })
                  }
                />
              </label>
              <label>
                Memory note
                <input
                  value={form.memory}
                  onChange={(e) => setForm({ ...form, memory: e.target.value })}
                />
              </label>
            </div>
          </>
        )}
        {msg && <div className="error">{msg}</div>}
        <button className="primary">
          Save it forever <BookOpen size={18} />
        </button>
      </form>
    </main>
  );
}
function Diary() {
  const [data, setData] = useState(null),
    [loading, setLoading] = useState(true);
  const load = async () => {
    try {
      const r = await api.get("/users/me");
      setData(r.data);
    } catch {}
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, []);
  const del = async (id) => {
    if (confirm("Delete this memory?")) {
      await api.delete(`/stories/${id}`);
      load();
    }
  };
  if (!currentUser()) return <RedirectLogin />;
  return (
    <main className="section diary">
      <div className="page-title">
        <div>
          <div className="eyebrow">YOUR PRIVATE CORNER</div>
          <h1>My Diary</h1>
          <p>Everything you chose to keep.</p>
        </div>
        <Link className="primary" to="/create">
          <Plus size={18} /> Add memory
        </Link>
      </div>
      {loading ? (
        <div className="empty">Opening your diary…</div>
      ) : (
        <>
          <div className="stats">
            <div>
              <strong>{data?.stories.length || 0}</strong>
              <span>stories</span>
            </div>
            <div>
              <strong>{data?.places.length || 0}</strong>
              <span>places</span>
            </div>
            <div>
              <strong>{data?.user?.favoriteEra || "—"}</strong>
              <span>favorite era</span>
            </div>
          </div>
          <h2 className="subhead">Your stories</h2>
          <div className="grid">
            {data?.stories?.map((s) => (
              <StoryCard key={s._id} s={s} own onDelete={del} />
            ))}
          </div>
        </>
      )}
    </main>
  );
}
function Places() {
  const [places, setPlaces] = useState([]),
    [q, setQ] = useState("");
  const load = async () =>
    setPlaces((await api.get("/places", { params: { q } })).data);
  useEffect(() => {
    load();
  }, []);
  return (
    <main className="section">
      <div className="section-head">
        <div>
          <div className="eyebrow">MEMORY MAP</div>
          <h1>Places that stayed.</h1>
          <p>Not every place is a location. Some are chapters.</p>
        </div>
        <form
          className="search"
          onSubmit={(e) => {
            e.preventDefault();
            load();
          }}
        >
          <Search size={18} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search places…"
          />
        </form>
      </div>
      <div className="places-grid">
        {places.map((p) => (
          <article className="place-card" key={p._id}>
            <div className="place-pin">
              <MapPin />
            </div>
            <div>
              <span className="place-location">
                {p.city}
                {p.city && p.state ? ", " : ""}
                {p.state}
              </span>
              <h3>{p.placeName}</h3>
              <p>{p.description}</p>
              {p.memory && <blockquote>“{p.memory}”</blockquote>}
              <div className="card-foot">
                <span className="author">@{p.author?.username}</span>
                <span className="muted">{p.bestTimeToVisit}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
function Profile() {
  const username = useLocation().pathname.split("/").pop();
  const [data, setData] = useState(null);
  useEffect(() => {
    api
      .get(`/users/${username}`)
      .then((r) => setData(r.data))
      .catch(() => {});
  }, [username]);
  if (!data) return <main className="empty">Finding this memory keeper…</main>;
  return (
    <main className="section profile">
      <div className="profile-hero">
        <div className="avatar">{data.user.username[0].toUpperCase()}</div>
        <div>
          <div className="eyebrow">MEMORY KEEPER</div>
          <h1>@{data.user.username}</h1>
          <p>{data.user.bio}</p>
          <span className="era">Favorite era: {data.user.favoriteEra}</span>
        </div>
      </div>
      <div className="stats">
        <div>
          <strong>{data.stories.length}</strong>
          <span>memories</span>
        </div>
        <div>
          <strong>{data.places.length}</strong>
          <span>places</span>
        </div>
        <div>
          <strong>{new Date(data.user.createdAt).getFullYear()}</strong>
          <span>joined</span>
        </div>
      </div>
      <h2 className="subhead">Their memories</h2>
      <div className="grid">
        {data.stories.map((s) => (
          <StoryCard key={s._id} s={s} />
        ))}
      </div>
    </main>
  );
}
function RedirectLogin() {
  const n = useNavigate();
  useEffect(() => n("/login"), []);
  return null;
}
function App() {
  const path = useLocation().pathname;
  if (path === "/login")
    return (
      <Layout>
        <Auth />
      </Layout>
    );
  if (path === "/signup")
    return (
      <Layout>
        <Auth signup />
      </Layout>
    );
  if (path === "/create")
    return (
      <Layout>
        <Create />
      </Layout>
    );
  if (path === "/diary")
    return (
      <Layout>
        <Diary />
      </Layout>
    );
  if (path === "/places")
    return (
      <Layout>
        <Places />
      </Layout>
    );
  if (path.startsWith("/profile/"))
    return (
      <Layout>
        <Profile />
      </Layout>
    );
  return (
    <Layout>
      <Home />
    </Layout>
  );
}
createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);
