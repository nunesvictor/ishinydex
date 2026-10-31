# iShinyDex

**English** · [Português](README.pt-BR.md)

Organize your Pokémon collection in the style of **Pokémon HOME** boxes and
keep track of your shiny hunts. Build your PersonalDex (with the standard
set of forms, regular or shiny), see what's missing in each box, register
your specimens (shiny, alpha, Poké Ball, trainer, capture date…) and count
the encounters of each hunt until the shiny shows up.

### ▶️ [Open iShinyDex](https://nunesvictor.github.io/ishinydex/)

Just want a look? The
[**demo**](https://nunesvictor.github.io/ishinydex/demo/) comes with sample
data, which is gone when you reload the page.

- **No account, no server:** your data stays on your device.
- **Works offline**, once opened.
- **Installs as an app** on iPhone, iPad and desktop.
- **Optional sync** with your Dropbox, to have the same data on all your
  devices.
- **In English and Portuguese.**

## What you can do

- **PersonalDex:** 30-slot boxes, like in HOME, with progress per box and
  per generation and a highlight of what's missing. Each slot shows the form
  and the deposited specimen, with base stats, type matchups, the evolution
  line and which games it appears in. Swipe to move from one slot to the
  next.
- **Specimens:** an inventory of everything you own, with filters (rarity,
  game, status, type, generation…), bulk editing, sending to a game and the
  list of what's **Away from HOME**.
- **Hunts:** what's still missing as a shiny in your shiny dex, and your
  hunts in progress, with a counter (+1, hold to count fast) or a timer, the
  game's method, the odds with the Shiny Charm, and pauses. On "Found it!",
  the specimen comes pre-filled, and the app offers a **hunt card** to
  share. Hunts don't need a dex.
- **Trainers and saves:** your OTs and the saves of each game, which tell in
  which games each form can be hunted and which methods apply.
- **Shiny locks:** forms with no shiny (or distribution only) are marked,
  and you can add your own.

## Install

iShinyDex runs in the browser. Once installed, it opens full screen, with
its own icon, like an app.

**iPhone and iPad**
1. Open the [app link](https://nunesvictor.github.io/ishinydex/) in
   **Safari**.
2. Tap **Share** (the square with the arrow; on iOS 26 and later, it's in
   the **⋯** menu next to the address) → **Add to Home Screen** → **Add**.
3. Always use it from the Home Screen icon. On iPhone and iPad, the
   installed app keeps its data separate from Safari.

> **Careful when reinstalling.** On iPhone and iPad, removing the icon
> deletes the installed app's data (and the Dropbox login), and adding it
> again creates an empty app. Before reinstalling (for example, to get the
> new icon after an update), keep Dropbox sync on and connect again in the
> new app, or use **Export data** and import the file there.

**Desktop (Chrome or Edge)**
1. Open the [app link](https://nunesvictor.github.io/ishinydex/).
2. Click the **install** icon in the address bar (or look for the install
   option in the browser's ⋮ menu).

You can also use it right in the browser, without installing.

**Updates:** when a new version is out, the app tells you ("A new version of
iShinyDex is available") with a **Reload** button. The installed version is
shown in **Settings → About iShinyDex**.

**Language:** the app follows your device's language (English or
Portuguese; English for any other). To change it, use **Settings →
Language**.

## Your data

Everything you register stays **on your device**, in the browser's storage
(or the installed app's). Nobody else has access to it, not even the
project's maintainer.

That also means that if you clear the site's data in the browser or remove
the app (even to install it again), your data goes with it. So:

### Back up

In **Settings → Your data**:
- **Export data** downloads a `.json` file with everything. On iPhone and
  iPad, you can save it to iCloud Drive (**Save to Files**).
- **Import data** reads an exported file and shows a summary before
  applying it:
  - **Replace this device's data** makes the device exactly like the file;
  - **Merge with this device's data** keeps both sides; if the same record
    changed on both, the most recent change wins.

The same file also moves your data to another device without Dropbox.

## Sync with Dropbox (optional)

With Dropbox on, your desktop, iPhone and iPad share the same data, and you
get an automatic backup in your own account.

1. In **Settings → Your data → Sync**, tap **Connect to Dropbox** and
   authorize it on the Dropbox site.
2. Repeat on each device. If the device already has data and so does
   Dropbox, the app asks what to do: **Merge both** (recommended), **Use
   only Dropbox's** or **Use only this device's**.

From then on, the app syncs on its own: when it opens, when you come back
to it, a few seconds after each change and when you pull the dex list to
refresh. There's also a **Sync now** button. Offline, it keeps your changes
and sends them when the connection is back.

- The app only sees **its own folder**, inside `Apps` in your Dropbox, where
  it writes a single file (`ishinydex.json`). It can't see any other file of
  yours.
- **Disconnect** (on the same screen) only turns sync off: your data stays
  on the device and in Dropbox.
- If you see "Couldn't sync" because access expired, disconnect and
  connect again.

## Privacy

iShinyDex has no server, no account, no tracking cookies, no usage
analytics and no ads. The hunt card is made on your device and only leaves
it if you share it. Details in the
[**privacy policy**](https://nunesvictor.github.io/ishinydex/privacy/)
(in Portuguese: [política de privacidade](https://nunesvictor.github.io/ishinydex/privacidade/)).

## Host your own copy

The link above is the copy published by the project's maintainer. You can
publish your own, for free, on your account's GitHub Pages: the data of
whoever uses your copy stays on their devices, and the app never talks to
the original copy. (Only the build downloads the catalog from the
[ishinydex-backend](https://github.com/nunesvictor/ishinydex-backend/releases)
releases.)

1. **Fork** this repository on GitHub.
2. In the fork, open the **Actions** tab and enable the workflows (GitHub
   turns them off in forks).
3. In **Settings → Pages**, choose **Source: GitHub Actions**.
4. Publish: **Actions → Pages → Run workflow** (on `main`). The app will be
   at `https://<your-user>.github.io/<repository-name>/`. To also publish
   from `v*` tags, like here, allow that pattern in **Settings →
   Environments → github-pages**.
5. **Dropbox (optional):** without this step, your copy works without sync
   (export and import still work).
   1. At [dropbox.com/developers/apps](https://www.dropbox.com/developers/apps),
      create an app: **Scoped access** → **App folder**.
   2. In **Permissions**, check `files.content.read`, `files.content.write`
      and `account_info.read` and click **Submit**.
   3. In **Settings → OAuth 2 → Redirect URIs**, add the exact address of
      your copy, with the trailing slash
      (`https://<your-user>.github.io/<repository-name>/`).
   4. Copy the **App key** (it's public; the *App secret* isn't used) and
      save it in the fork under **Settings → Secrets and variables →
      Actions → Variables**, named `DROPBOX_APP_KEY`.
   5. Publish again (step 4).

   While the Dropbox app is in development, only your account can connect.
   To let other people in, use **Enable additional users** in the Dropbox
   console (up to 500 accounts; from 50 on, Dropbox requires the production
   request).

## Legal notice

iShinyDex is a free, non-profit fan project. Pokémon and the related names,
images and trademarks are property of Nintendo, Creatures, GAME FREAK and
The Pokémon Company. Reference data comes from [PokéAPI](https://pokeapi.co/)
and images from the [PokeAPI/sprites](https://github.com/PokeAPI/sprites)
repository. The game, type and origin mark icons, in the Pokémon HOME
style, come from the [Bulbagarden Archives](https://archives.bulbagarden.net/),
and the curated lists (shiny locks, shiny methods and odds, forms per game)
were checked against [Bulbapedia](https://bulbapedia.bulbagarden.net/).
iShinyDex is not affiliated with any of these companies or sites, nor with
Dropbox.

## License

The iShinyDex code (this repository, the
[backend](https://github.com/nunesvictor/ishinydex-backend) and the
[frontend](https://github.com/nunesvictor/ishinydex-frontend)) is under the
[MIT license](LICENSE). The license does not cover Pokémon names, images and
trademarks, nor third-party icons, sprites and data (see the legal notice
above and each repository's README); those keep their own terms.

## For developers

| Folder | Repository | What it is |
| --- | --- | --- |
| `frontend/` | [ishinydex-frontend](https://github.com/nunesvictor/ishinydex-frontend) | The app (Flutter) |
| `backend/` | [ishinydex-backend](https://github.com/nunesvictor/ishinydex-backend) | Builds the catalog (reference data, from PokéAPI) |

This repository joins both as **git submodules**, publishes the app to
GitHub Pages on each `v*` tag and holds the releases. Workflow and
versioning: [CONTRIBUTING.md](CONTRIBUTING.md) (in Portuguese). Issues and
ideas: [issues](https://github.com/nunesvictor/ishinydex/issues).

Up to `v1.0.0`, iShinyDex was a server (Django + Postgres) running with
`docker compose`. Since `v2.0.0`, the data lives on the devices.
