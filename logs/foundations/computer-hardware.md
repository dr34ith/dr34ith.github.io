
A computer is an electronic device following instructions stored in its own memory. Feed it data, it processes that data according to a defined set of rules, and out comes something meaningful.

Here's the thing that took me a while to really get: it's not one mysterious black box, it's a handful of parts that each do one job well.


## The 3 Main Components

- **CPU:** the "brain." Sits in the large square socket in the center-left of the motherboard.
- **RAM:** short-term memory. Slots into the long horizontal slots at the top. It's fast, but forgetful — cut the power and everything it was holding disappears.
- **Graphics Card (GPU):** handles anything visual. Installed in the long vertical PCIe slots in the center.

Beyond those three, the fuller parts list looks like this, the motherboard as the "house" everyone else lives in, storage devices as the long-term memory that survives a power-off, the PSU converting wall power into something the components can actually use, and so on down to input/output devices translating between "what you do" and "what the computer understands."

## Power & Connectivity

- **Power Supply (PSU):** connects to the long, 24-pin black socket at the top-center.
- **Input/Output (I/O):** that vertical strip of USB, HDMI, and audio ports on the far left — basically where the outside world plugs in.
- **Network Adapter:** usually built into the I/O already, or added on through the far-right PCIe expansion slot if you need more.

> Before touching any of this, two habits are non-negotiable: turn off and disconnect the power, and wear safety goggles. Learned this the boring, responsible way  not the hard way, thankfully.

A quick voltage note worth remembering: voltage is really just electrical pressure, the force pushing electricity through a device. A few components carry surprisingly high voltage even when everything looks "off"  power supplies, capacitors, and laser printer parts especially. Worth respecting, not fearing.

And this is exactly why the antistatic gear from earlier isn't optional: **Electrostatic Discharge (ESD)** is the sudden release of static electricity jumping from one object to another. It's often silent enough that you won't even feel it happen, but it can quietly fry sensitive components. An antistatic wrist strap works by equalizing the electrical charge between you and the equipment — that's the actual mechanism protecting the hardware.

## Storage (SSD/HDD)
![ssd-hdd](logs/assets/ssd-vs-hdd.png)
- **SATA Ports:** the small, L-shaped connectors on the bottom-right edge, used for standard drives.
- **M.2 Slots:** often hidden under a silver rectangular heatsink  that's where the fast NVMe sticks go.

A few extra details worth filing away: optical drives install into 5.25" (13.34 cm) bays accessed from the front of the case, while SSDs and hard drives typically go into a 3.5" (8.9 cm) or 5.25" bay that *isn't* front-accessible. If a drive is smaller than its bay, a tray can be purchased to make it fit properly. Flash drives, meanwhile, just connect through USB.

## The 5 Stages of Booting

Every time you hit that power button, a surprisingly fast sequence kicks off underneath:

1. **Press Power Button (Physical Trigger)** — sends a signal to the Power Supply Unit, which distributes electricity to the motherboard and every component attached to it.
2. **Firmware Starts (UEFI/BIOS)** — the very first software to run, stored on a chip on the motherboard itself. Its job is to wake up the hardware and get everything talking to each other.
3. **Power-On Self Test (POST)** — the system's own diagnostic check. It verifies the essentials (CPU, RAM, GPU) are actually present and working. If something's wrong here, you'll hear beep codes or see an error message instead of a normal boot.
4. **Select Boot Device** — UEFI works through a priority list you've set in the settings, hunting for a drive (SSD, HDD, USB) that actually has an OS on it.
5. **Initiate Bootloader** — the bootloader pulls the OS into RAM, and UEFI finally hands over full control. Windows, macOS, or Linux takes it from there, and startup is complete.

## Step by Step: Disassembling a Computer

The order matters more than it looks like it should — skipping ahead is usually how something gets damaged or forgotten:

Step 1: Power off the computer and unplug the power cable.
Step 2: Press and hold the power button for 5–10 seconds, to drain any leftover charge.
Step 3: Disconnect the mouse, keyboard, monitor, and network cable.
Step 4: Remove the case screws and open the case.
Step 5: Disconnect the SATA power and SATA data cables.
Step 6: Remove the hard drive.
Step 7: Remove the optical drive.
Step 8: Remove the adapter card.
Step 9: Remove the power supply.
Step 10: Remove the front panel connectors and RAM.

## Putting It Back Together

Taking it apart is the easy half — reassembly is where the details actually matter.

**Installing the CPU:** orient it correctly to the socket, press it in gently, lock it into place, apply thermal paste, then install and secure the heatsink. This is the part I'm most careful with — small, expensive, and unforgiving of rough handling.

**Installing the RAM:** open the slot levers, orient the chip to the slot, lower it in, and press down firmly until it clicks and locks.

**Installing the motherboard:** align it in the correct direction (this matters more than it seems), locate and install the standoffs in the case, align the I/O plate to the back of the case, lower the motherboard into place, then screw it down into the standoffs.

**Connecting internal power cables:** align and press in the 24-pin ATX connector, the 4-pin auxiliary connector, and the CPU fan connector — each one clicks when it's properly seated.

**Connecting internal data cables:** plug one end of the SATA cable into the motherboard socket, and the other into the smaller SATA port on the drive.

**Front panel connectors** are the fiddly part — small pins, easy to mix up. Power switch goes to PWR_SW, reset to RESET, power LED to PWR_LED, drive activity LED to HDD_LED, speaker to SPEAKER, plus the USB and audio headers. Worth double-checking the motherboard manual for exact placement every time.

**Closing it all up:** reattach the front panel if removed, connect the power cable to the PSU, hook up USB and video cables (tightening the video cable's screws), connect the network cable to the Ethernet port and the audio cables to their ports, then slide the side panel back on and secure the screws.

## Mobile Devices
![mobile](logs/assets/mobile.jpg)

A quick detour into the smaller stuff — phones and tablets share some DNA with desktops, but the wireless side of things deserves its own notes.

**Augmented Reality (AR)** is what happens when computer graphics get layered on top of the real world — usually seen through the device's camera, blending the digital and physical into one view.

Mobile devices lean on a few wireless technologies that are easy to mix up:

- **Near Field Communication (NFC)** — lets two devices talk by simply being close together, or even touching. Think tap-to-pay.
- **Infrared (IR)** — if a device is IR-enabled, it can remotely control other IR devices, like a TV or audio equipment. Basically, your phone becomes a universal remote.
- **Bluetooth** — a short-range wireless technology for exchanging data between two Bluetooth-enabled devices, or connecting to peripherals like speakers and headphones. Bluetooth also comes in classes by range: Class 1 reaches up to 100 meters, Class 2 up to 10 meters, Class 3 up to 1 meter.

## Laptops
![laptop](logs/assets/laptop.webp)

Laptops run on the same core ideas as desktops, just everything is squeezed, soldered, and miniaturized to fit.

A laptop's **motherboard** looks nothing like a desktop's — proprietary form factor, Mini-PCI expansion slots, SODIMM RAM slots. Every component has to compromise on size to fit the chassis.

**Internal components, laptop-style:**

- **RAM** — laptops use compact "memory modules" called SODIMMs (Small Outline Dual In-Line Memory Modules).
- **CPU** — built to sip less power and generate less heat, since there's no room for a big desktop-style cooler.
- **SATA drives** — 1.8" or 2.5" wide, drawing less power, though the trade-off is a slower spin rate (up to 10,000 RPM).
- **Solid-State Drives** — laptop SSDs can shrink down to roughly the size of a stick of gum.

The **Function (Fn) key**, combined with the F keys across the top of the keyboard, unlocks shortcuts — screen brightness, toggling Bluetooth, toggling Wi-Fi, and more. It essentially gives the F1–F12 keys a second job.

**Tethering** is what happens when a cellphone shares its connection so other devices can piggyback off it. And connecting a device to Wi-Fi manually just comes down to three things: enter the network's SSID, choose the security type it uses, then enter the password to authenticate.

**Maintenance** matters more here than on a desktop — laptops and mobile devices spend their lives exposed to dust, drops, and general wear that a desktop tucked under a desk never has to deal with.

## Things Worth Remembering

- Non-metallic screws and standoffs can act as insulators, which actually protects against grounding.
- Laser printers pull high voltage when they first power on, and again to charge the drum before writing data to it — which is exactly why they usually aren't plugged into a UPS.
- Laser printers also include a fuser assembly, which applies heat and pressure to permanently bond toner to the paper. Unplug it and let the fuser cool down before working inside — skipping this step is how people get burned, literally.
- With the P-A-S-S method for fire extinguishers, the "A" means aim at the base of the fire, not the flames themselves.
- The PCIe bus comes in four expansion slot lengths: x1, x4, x8, and x16.
- To install a power supply into a PC tower case: open the case, line up the power supply with the case's mounting holes, and secure it with screws.