import random
from datetime import datetime

from textual.app import App, ComposeResult
from textual.containers import Horizontal, Vertical
from textual.reactive import reactive
from textual.widgets import DataTable, Footer, ProgressBar, Static

INTEL_LOGS = [
    "LOG: Satellite uplink SIGINT-7 is stable and being re-routed through the secure relay mesh.",
    "SEC: Firewall breach confirmed in Sector 4. Automated containment is active across all mirrored zones.",
    "OPS: Drone asset Alpha-6 has reached coordinates 34.0522° N, 118.2437° W and is now scanning the thermal corridor.",
    "DECRYPT: 4096-bit RSA handshake recovered in 0.42 seconds; packet integrity remains above threshold.",
    "SYS: Primary mainframe thermal envelope is nominal at 42°C with an acceptable load margin.",
    "INTEL: EMEA geopolitical risk index is trending upward; asset relocation window is narrowing.",
    "NET: Compromised honeypot logs purged and archived to sealed offsite storage.",
    "SEC: Remote biometric verification requested from Base Echo; all identity checks are green.",
    "OPS: Classified quorum with Sector Directors is scheduled in six minutes.",
    "SIG: Signal scrubber detected low-noise jamming on frequency band 7.81 GHz.",
]

THREAT_CATALOG = [
    ["ASSET-09", "Berlin, DE", "CRITICAL", "Intercept Active"],
    ["NODE-88", "Nairobi, KE", "ELEVATED", "Monitoring"],
    ["UPLINK-X", "Tokyo, JP", "STABLE", "Encrypted"],
    ["PROXY-4", "Unknown", "HIGH", "Tracing Signal..."],
    ["AGENT-K", "London, UK", "STABLE", "Standby"],
    ["RELAY-11", "Seoul, KR", "CRITICAL", "Relay Lock"],
    ["FALCON-3", "Cape Town, ZA", "MONITORED", "Passive Sweep"],
    ["SABLE-21", "Vancouver, CA", "LOW", "Ghost Routing"],
]


class TacticalHeader(Static):
    time_str = reactive("")

    def on_mount(self) -> None:
        self.set_interval(1.0, self.update_time)

    def update_time(self) -> None:
        self.time_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S UTC")
        self.update(
            "⚡ [bold cyan]BLACKSITE COMMAND MATRIX[/] | "
            "[bold red]CLEARANCE LEVEL 7[/] | [bold white]OPERATIONS STATUS: ACTIVE[/] | "
            f"{self.time_str}"
        )


class LiveLogConsole(Static):
    log_history = []

    def on_mount(self) -> None:
        self.set_interval(1.3, self.add_log_entry)
        self.add_log_entry()

    def add_log_entry(self) -> None:
        new_entry = f"[{datetime.now().strftime('%H:%M:%S')}] {random.choice(INTEL_LOGS)}"
        self.log_history.append(new_entry)
        if len(self.log_history) > 12:
            self.log_history.pop(0)

        display_text = "\n".join(self.log_history)
        display_text = display_text.replace("SEC:", "[bold red]SEC:[/] ")
        display_text = display_text.replace("DECRYPT:", "[bold green]DECRYPT:[/] ")
        display_text = display_text.replace("LOG:", "[bold yellow]LOG:[/] ")
        display_text = display_text.replace("OPS:", "[bold magenta]OPS:[/] ")
        display_text = display_text.replace("SIG:", "[bold cyan]SIG:[/] ")
        display_text = display_text.replace("INTEL:", "[bold white]INTEL:[/] ")

        self.update(display_text)


class SystemStatus(Static):
    def on_mount(self) -> None:
        self.set_interval(1.0, self.refresh_status)
        self.refresh_status()

    def refresh_status(self) -> None:
        threat = random.randint(81, 99)
        signal = random.randint(71, 98)
        drones = random.randint(18, 42)
        risk = random.randint(26, 89)
        self.update(
            f"[bold white]THREAT INDEX[/] [bold red]{threat}%[/]\n"
            f"[bold white]SIGNAL QUALITY[/] [bold green]{signal}%[/]\n"
            f"[bold white]ACTIVE DRONES[/] [bold cyan]{drones}[/]\n"
            f"[bold white]REGIONAL RISK[/] [bold yellow]{risk}%[/]"
        )


class DiagnosticsPanel(Static):
    def compose(self) -> ComposeResult:
        yield Static("[bold green]CENTRAL CORE LOAD[/]", classes="panel-label")
        yield ProgressBar(id="cpu_bar", total=100, show_percentage=True, show_eta=False)
        yield Static("\n[bold cyan]ENCRYPTED UPLINK THROUGHPUT[/]", classes="panel-label")
        yield ProgressBar(id="net_bar", total=100, show_percentage=True, show_eta=False)
        yield Static("\n[bold magenta]BROADCAST NOISE FLOOR[/]", classes="panel-label")
        yield ProgressBar(id="noise_bar", total=100, show_percentage=True, show_eta=False)

    def on_mount(self) -> None:
        self.set_interval(0.9, self.simulate_metrics)
        self.simulate_metrics()

    def simulate_metrics(self) -> None:
        self.query_one("#cpu_bar", ProgressBar).progress = random.randint(38, 93)
        self.query_one("#net_bar", ProgressBar).progress = random.randint(20, 88)
        self.query_one("#noise_bar", ProgressBar).progress = random.randint(12, 72)


class CIAGuiApp(App):
    CSS = """
    Screen {
        background: #03080d;
        color: #d8f7ff;
        overflow: hidden;
    }

    TacticalHeader {
        background: #07151c;
        border-bottom: double #12d4ff;
        padding: 1 2;
        height: 3;
        color: #d9f3ff;
    }

    .dashboard {
        width: 100%;
        height: auto;
        padding: 1 2 0 2;
    }

    .metric-card {
        width: 1fr;
        min-height: 6;
        margin: 0 1 1 1;
        padding: 1 2;
        border: solid #1d8ae6;
        background: #091b2a;
        color: #dff7ff;
    }

    .module-box {
        border: solid #1ab69d;
        background: #081910;
        padding: 1;
        margin: 0 1 1 1;
    }

    .title {
        color: #f3f8ff;
        background: #0e2131;
        border: solid #204f74;
        padding: 0 1;
        margin-bottom: 1;
        text-align: center;
        text-style: bold;
    }

    .panel-label {
        color: #aee8ff;
        margin-top: 1;
    }

    LiveLogConsole {
        height: 16;
        color: #7ef1c8;
        background: #041711;
        border: solid #11362e;
        padding: 1;
        overflow: auto;
    }

    DataTable {
        height: 14;
        border: solid #214d53;
        background: #020d12;
        color: #d3fff5;
    }

    ProgressBar {
        margin: 0 0 1 0;
    }

    Footer {
        background: #071018;
        color: #9ce7ff;
    }
    """

    BINDINGS = [("q", "quit", "Shut Down Console"), ("r", "refresh_feed", "Refresh Feed")]

    def compose(self) -> ComposeResult:
        yield TacticalHeader()
        yield Horizontal(
            Static("[bold white]THREAT INDEX[/] [bold red]97.4%[/]", classes="metric-card"),
            Static("[bold white]ACTIVE NODES[/] [bold cyan]128[/]", classes="metric-card"),
            Static("[bold white]DRONE FLEET[/] [bold green]42[/]", classes="metric-card"),
            Static("[bold white]SIGNAL COVERAGE[/] [bold yellow]91%[/]", classes="metric-card"),
            classes="dashboard",
        )

        yield Horizontal(
            Vertical(
                Static("📡 TARGET INTELLIGENCE MATRIX", classes="title"),
                DataTable(id="threat_matrix"),
                classes="module-box",
            ),
            Vertical(
                Static("🖥️ LIVE CRYPTO INTERCEPT LOG", classes="title"),
                LiveLogConsole(),
                Static("\n🛡️ SYSTEM INTEGRITY", classes="title"),
                SystemStatus(),
                classes="module-box",
            ),
        )

        yield Horizontal(
            Vertical(
                Static("🛰️ ASSET ROUTE TOPOLOGY", classes="title"),
                Static(
                    "[bold cyan]SEALED NODE[/] ────── [bold green]STABLE[/]\n"
                    "[bold red]ALPHA-6[/] ──▶ [bold yellow]NORTH SECTOR[/]\n"
                    "[bold cyan]GHOST RELAY[/] ──▶ [bold green]ENCRYPTED[/]\n"
                    "[bold red]PROXY-4[/] ──▶ [bold white]TRACE ACTIVE[/]\n"
                    "[bold cyan]RELAY-11[/] ────── [bold red]LOCKED[/]"
                , classes="module-box"),
                classes="module-box",
            ),
            Vertical(
                Static("📊 HARDWARE DIAGNOSTICS", classes="title"),
                DiagnosticsPanel(),
                classes="module-box",
            ),
        )
        yield Footer()

    def on_mount(self) -> None:
        self.populate_threat_matrix()
        self.set_interval(2.5, self.refresh_threat_matrix)
        self.query_one("#threat_matrix", DataTable).cursor_type = "row"

    def populate_threat_matrix(self) -> None:
        table = self.query_one("#threat_matrix", DataTable)
        table.clear(columns=True)
        table.add_columns("TARGET ID", "LOCATION", "THREAT", "STATUS")
        for row in THREAT_CATALOG:
            table.add_row(row[0], row[1], f"[bold {self.threat_color(row[2])}]{row[2]}[/]", row[3])

    def refresh_threat_matrix(self) -> None:
        table = self.query_one("#threat_matrix", DataTable)
        rows = []
        for row in THREAT_CATALOG:
            mutated = list(row)
            status_pool = ["STABLE", "MONITORED", "ELEVATED", "CRITICAL", "HIGH", "LOW"]
            mutated[2] = random.choice(status_pool)
            mutated[3] = random.choice(["Intercept Active", "Monitoring", "Encrypted", "Standby", "Relay Lock", "Passive Sweep"])
            rows.append(mutated)

        table.clear(columns=False)
        for row in rows:
            table.add_row(row[0], row[1], f"[bold {self.threat_color(row[2])}]{row[2]}[/]", row[3])

    def threat_color(self, threat: str) -> str:
        mapping = {
            "CRITICAL": "red",
            "HIGH": "red",
            "ELEVATED": "yellow",
            "MONITORED": "cyan",
            "STABLE": "green",
            "LOW": "green",
        }
        return mapping.get(threat, "white")

    def action_refresh_feed(self) -> None:
        self.refresh_threat_matrix()
        self.query_one("LiveLogConsole", LiveLogConsole).add_log_entry()


if __name__ == "__main__":
    app = CIAGuiApp()
    app.run()
