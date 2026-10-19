# Bring the ChatGPT desktop main window to the foreground.
# Chromium marks an OCCLUDED page as hidden and throttles rAF, which freezes
# Code-Codex enable flows (they wait on a double-rAF). Picking the window by
# exact title avoids IME helper windows like "MSCTFIME UI"/"Default IME".
Add-Type -TypeDefinition @'
using System;
using System.Text;
using System.Collections.Generic;
using System.Runtime.InteropServices;
public class CodeCodexWin3 {
  public delegate bool EnumProc(IntPtr h, IntPtr lp);
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr h, int cmd);
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h);
  [DllImport("user32.dll")] public static extern bool EnumWindows(EnumProc cb, IntPtr lp);
  [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr h, out uint pid);
  [DllImport("user32.dll")] public static extern int GetWindowText(IntPtr h, StringBuilder sb, int max);
  [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr h);
  public static IntPtr Best = IntPtr.Zero;
  public static void Collect(List<uint> pids) {
    EnumWindows((h, lp) => {
      uint pid; GetWindowThreadProcessId(h, out pid);
      if (!pids.Contains(pid)) return true;
      var sb = new StringBuilder(256);
      GetWindowText(h, sb, 256);
      string t = sb.ToString();
      if (t == "ChatGPT" || t.StartsWith("Codex")) { Best = h; return false; }
      return true;
    }, IntPtr.Zero);
  }
}
'@
$pids = New-Object 'System.Collections.Generic.List[uint32]'
foreach ($p in @(Get-Process ChatGPT -ErrorAction SilentlyContinue)) { $pids.Add([uint32]$p.Id) }
if ($pids.Count -eq 0) { Write-Output "no-process"; exit 1 }
[CodeCodexWin3]::Collect($pids)
$h = [CodeCodexWin3]::Best
if ($h -eq [IntPtr]::Zero) { Write-Output "no-titled-window"; exit 1 }
[CodeCodexWin3]::ShowWindow($h, 9) | Out-Null
[CodeCodexWin3]::SetForegroundWindow($h) | Out-Null
Write-Output ("foregrounded hwnd=" + $h)
