import asyncio
import random
from datetime import datetime
from textual.app import App, ComposeResult
from textual.containers import Container, Horizontal, Vertical
from textual.reactive import reactive
from textual.widgets import Header, Footer, Static, DataTable, ProgressBar

# Simulated stream of top-secret operational log messages
INTEL_LOGS = [
    "LOG: Intercepting satellite uplink SIGINT-7...",
    "SEC: Firewall breach detected in Sector 4 (IP: 192.168.42.10).",
    "OPS: Drone asset Alpha-6 deployed to coordinates 34.0522° N, 118.2437° W.",
    "DECRYPT: Breaking 4096-bit RSA handshake... Success.",
    "SYS: Mainframe temperature nominal at 42°C.",
    "INTEL: Geopolitical risk index spiking in EMEA region.",
    "NET: Purging compromised honeypot logs...",
    "SEC: Biometric node verification requested from Remote Base Echo.",
]

class TacticalHeader(Static):
    """A top panel showing the facility status and system time."""
    time_str = reactive("")

    def on_mount(self) -> None:
        self.set_interval(1.0, self.update_time)

    def update_time(self) -> None:
        self.time_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S UTC")
        self.update(f"⚡ [bold cyan]LANGLEY CENTRAL OPERATIONS[/] | SECURITY LEVEL: [bold red]CLEARANCE LEVEL 5[/] | {self.time_str}")

class LiveLogConsole(Static):
    """A streaming text console replicating automated decryption logs."""
    log_history = []

    def on_mount(self) -> None:
        self.set_interval(1.5, self.add_log_entry)

    def add_log_entry(self) -> None:
        new_entry = f"[{datetime.now().strftime('%H:%M:%S')}] {random.choice(INTEL_LOGS)}"
        self.log_history.append(new_entry)
        if len(self.log_history) > 12:  # Keep console clean
            self.log_history.pop(0)
        
        # Color specific keywords to look like a real cyber GUI
        display_text = "\n".join(self.log_history)
        display_text = display_text.replace("SEC:", "[bold red]SEC:[/] ")
        display_text = display_text.replace("DECRYPT:", "[bold green]DECRYPT:[/] ")
        display_text = display_text.replace("LOG:", "[bold yellow]LOG:[/] ")
        display_text = display_text.replace("OPS:", "[bold magenta]OPS:[/] ")
        
        self.update(display_text)

class DiagnosticsPanel(Static):
    """Live processing and network load indicator loops."""
    def compose(self) -> ComposeResult:
        yield Static("[bold green]MAINFRAME COMPUTE CORE LOAD[/]")
        yield ProgressBar(id="cpu_bar", total=100, show_percentage=True, show_eta=False)
        yield Static("\n[bold cyan]ENCRYPTED UPLINK BANDWIDTH[/]")
        yield ProgressBar(id="net_bar", total=100, show_percentage=True, show_eta=False)

    def on_mount(self) -> None:
        self.set_interval(0.8, self.simulate_metrics)

    def simulate_metrics(self) -> None:
        self.query_one("#cpu_bar", ProgressBar).progress = random.randint(35, 92)
        self.query_one("#net_bar", ProgressBar).progress = random.randint(10, 85)

class CIAGuiApp(App):
    """The main interface controller layout."""
    
    # Corrected Textual CSS dialect styling rules
    CSS = """
    Screen {
        background: #050b05;
        color: #33ff33;
    }
    TacticalHeader {
        background: #0c1a0c;
        border-bottom: double #11ff11;
        padding: 1 2;
        height: 3;
    }
    .module-box {
        border: solid #228822;
        background: #081108;
        padding: 1;
        margin: 1;
    }
    .title {
        color: #ffffff;
        background: #115511;
        padding: 0 1;
        margin-bottom: 1;
        text-align: center;
        text-style: bold;
    }
    LiveLogConsole {
        color: #55ff55;
    }
    DataTable {
        height: 100%;
        border: none;
        background: #081108;
    }
    """


    BINDINGS = [("q", "quit", "Shut Down Console")]

    def compose(self) -> ComposeResult:
        yield TacticalHeader()
        
        # Split layout into left and right tactical screens
        yield Horizontal(
            Vertical(
                Static("📡 TARGET INTELLIGENCE DATABASE", classes="title"),
                DataTable(id="threat_matrix"),
                classes="module-box"
            ),
            Vertical(
                Static("🖥️ LIVE CRYPTO INTERCEPT LOG", classes="title"),
                LiveLogConsole(),
                Static("\n📊 HARDWARE DIAGNOSTICS", classes="title"),
                DiagnosticsPanel(),
                classes="module-box"
            )
        )
        yield Footer()

    def on_mount(self) -> None:
        # Construct and style our threat tracking data matrix table
        table = self.query_one("#threat_matrix", DataTable)
        table.add_columns("TARGET ID", "LOCATION", "THREAT", "STATUS")
        
        table.add_row("🎯 ASSET-09", "Berlin, DE", "[bold red]CRITICAL[/]", "Intercept Active")
        table.add_row("🎯 NODE-88", "Nairobi, KE", "[bold yellow]ELEVATED[/]", "Monitoring")
        table.add_row("🎯 UPLINK-X", "Tokyo, JP", "[bold green]STABLE[/]", "Encrypted")
        table.add_row("🎯 PROXY-4", "Unknown", "[bold red]HIGH[/]", "Tracing Signal...")
        table.add_row("🎯 AGENT-K", "London, UK", "[bold green]STABLE[/]", "Standby")

if __name__ == "__main__":
    app = CIAGuiApp()
    app.run()





