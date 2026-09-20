export const SYSTEMS = [
  // Flight Management & Navigation
  { id: 'fms', name: 'FMS keyboard & display', desc: 'Flight management system — route, performance, and waypoint entry' },
  { id: 'nd_mode', name: 'Navigation display mode selector', desc: 'Switches between map, arc, rose, and plan display modes' },
  { id: 'nd_range', name: 'Navigation display range selector', desc: 'Adjusts the scale of the navigation map display' },
  { id: 'course_selector', name: 'Course selector', desc: 'Sets the VOR/ILS course for each pilot side' },
  { id: 'heading_selector', name: 'Heading selector', desc: 'Selects the target heading for autopilot or reference' },
  { id: 'altitude_selector', name: 'Altitude selector', desc: 'Sets the target altitude for autopilot capture' },
  { id: 'vs_selector', name: 'Vertical speed / flight path angle selector', desc: 'Sets climb or descent rate target' },
  { id: 'spd_selector', name: 'Airspeed / Mach selector', desc: 'Sets the target speed for autothrottle or reference' },
  { id: 'baro_selector', name: 'Barometric pressure setting', desc: 'Sets altimeter reference pressure (QNH/QFE) per pilot side' },
  { id: 'ils_selector', name: 'ILS frequency selector', desc: 'Tunes the ILS frequency for approach' },
  { id: 'radio_nav', name: 'Radio navigation tuning (VOR, ADF)', desc: 'Tunes VOR and ADF navigation beacons' },

  // Autoflight
  { id: 'autoflight_panel', name: 'Autoflight control panel', desc: 'Combined autopilot engage, flight director, and autothrottle switches' },
  { id: 'flight_mode_panel', name: 'Flight mode selector panel', desc: 'Approach, localizer, altitude, speed, heading, and vertical speed mode buttons' },

  // Flight Controls
  { id: 'pitch_trim', name: 'Stabilizer / pitch trim control', desc: 'Manual or electric trim adjustment for the horizontal stabilizer' },

  // Warning
  { id: 'master_warning', name: 'Master warning / caution reset panel', desc: 'Paired buttons to acknowledge and silence master warning and caution alerts' },

  // Communication
  { id: 'vhf_radio', name: 'VHF radio tuning (1 / 2 / 3)', desc: 'Tunes VHF radios for ATC and company communications' },
  { id: 'hf_radio', name: 'HF radio tuning', desc: 'Long-range high frequency radio for oceanic and remote comms' },
  { id: 'audio_panel', name: 'Audio & interphone control panel', desc: 'Selects active radios, interphone, and audio routing per pilot' },
  { id: 'pa_system', name: 'Passenger address system', desc: 'Cockpit-to-cabin announcement control' },
  { id: 'cvr_control', name: 'Cockpit voice recorder control', desc: 'CVR test and bulk erase functions' },
  { id: 'selcal', name: 'SELCAL', desc: 'Selective calling system for ATC alerting on HF/VHF' },
  { id: 'transponder', name: 'Transponder mode selector & code entry', desc: 'Sets ATC transponder mode (standby/on/alt) and squawk code' },
  { id: 'tcas_mode', name: 'TCAS mode selector', desc: 'Sets traffic collision avoidance system operating mode' },

  // Engine & APU
  { id: 'engine_start', name: 'Engine start selector', desc: 'Controls engine start sequence (ground/flight/continuous/off)' },
  { id: 'engine_ignition', name: 'Engine ignition selector', desc: 'Selects igniter type and activation mode' },
  { id: 'engine_antiice', name: 'Engine anti-ice switches', desc: 'Activates hot air anti-icing for each engine nacelle' },
  { id: 'engine_bleed', name: 'Engine bleed air switches', desc: 'Opens or closes bleed air extraction from each engine' },
  { id: 'engine_fire_panel', name: 'Engine fire panel', desc: 'Fire detection test and extinguisher discharge for each engine' },
  { id: 'apu_start', name: 'APU start & shutdown', desc: 'Controls auxiliary power unit ignition and shutdown sequence' },
  { id: 'apu_bleed', name: 'APU bleed air', desc: 'Routes APU pneumatic output to the air conditioning system' },
  { id: 'apu_fire', name: 'APU fire extinguisher discharge', desc: 'Fires the APU fire suppression bottle' },

  // Fuel
  { id: 'fuel_pumps', name: 'Fuel pump selector (per tank)', desc: 'Activates electric fuel pumps in each tank' },
  { id: 'fuel_xfeed', name: 'Fuel crossfeed / cross-transfer valve', desc: 'Opens valve to feed engines from opposite tank' },
  { id: 'fuel_center', name: 'Center tank transfer selector', desc: 'Controls transfer of fuel from center to wing tanks' },

  // Electrical
  { id: 'gen_control', name: 'Generator control panel', desc: 'Controls left, right, and APU generator connection to buses' },
  { id: 'bus_tie', name: 'Bus tie selector', desc: 'Connects or isolates electrical buses' },
  { id: 'ext_power', name: 'External power selector', desc: 'Connects ground power unit to aircraft electrical system' },
  { id: 'battery_master', name: 'Battery master (main / APU)', desc: 'Controls main and APU battery connection' },
  { id: 'galley_power', name: 'Galley power selector', desc: 'Switches power to galley equipment on or off' },
  { id: 'standby_power', name: 'Standby power selector', desc: 'Controls the standby electrical system source' },

  // Hydraulic
  { id: 'hyd_pumps', name: 'Hydraulic pump selector', desc: 'Activates engine-driven and electric hydraulic pumps per system' },
  { id: 'hyd_isolation', name: 'Hydraulic system isolation valve', desc: 'Isolates a hydraulic system in case of failure or leak' },

  // Pressurization & Air Conditioning
  { id: 'cabin_alt', name: 'Cabin altitude selector', desc: 'Sets the target cabin pressure altitude' },
  { id: 'press_mode', name: 'Pressurization mode selector', desc: 'Switches between automatic and manual pressurization control' },
  { id: 'landing_alt', name: 'Landing altitude preset', desc: 'Sets destination field elevation for pressurization scheduling' },
  { id: 'outflow_valve', name: 'Outflow valve position indicator', desc: 'Shows position of the cabin pressure outflow valve' },
  { id: 'ac_pack', name: 'Air conditioning pack selector', desc: 'Controls left and right air conditioning packs' },
  { id: 'recirc_fan', name: 'Recirculation fan selector', desc: 'Controls cabin air recirculation fans' },
  { id: 'cabin_temp', name: 'Cabin temperature zone selectors', desc: 'Sets individual temperature targets for cabin zones' },
  { id: 'ram_air', name: 'Ram air selector', desc: 'Opens ram air inlet for emergency ventilation' },
  { id: 'avionics_vent', name: 'Avionics ventilation selector', desc: 'Controls airflow through avionics cooling system' },

  // Ice & Rain Protection
  { id: 'wing_antiice', name: 'Wing anti-ice selector', desc: 'Routes hot bleed air to wing leading edges' },
  { id: 'wshield_heat', name: 'Windshield heat switches', desc: 'Activates electric heating for each windshield panel' },
  { id: 'probe_heat', name: 'Probe heat selector', desc: 'Activates heating for pitot probes, static ports, and AOA sensors' },
  { id: 'wipers', name: 'Wiper selector & speed', desc: 'Controls windshield wiper operation and speed per pilot side' },

  // Oxygen
  { id: 'crew_oxy', name: 'Crew oxygen supply selector', desc: 'Opens crew oxygen supply valve' },
  { id: 'pax_oxy', name: 'Passenger oxygen deployment', desc: 'Manually deploys passenger oxygen masks throughout cabin' },

  // Lighting
  { id: 'ext_lighting', name: 'Exterior lighting switches', desc: 'Controls navigation, strobe, beacon, and logo lights' },
  { id: 'landing_lights', name: 'Landing light switches', desc: 'Controls retractable and fixed landing lights' },
  { id: 'taxi_lights', name: 'Runway turnoff / taxi lights', desc: 'Controls ground maneuvering lighting' },
  { id: 'scan_lights', name: 'Wing / engine scan lights', desc: 'Illuminates wings and engine nacelles for night inspection' },
  { id: 'dome_light', name: 'Cockpit dome light', desc: 'Controls overhead white flood lighting in the cockpit' },
  { id: 'panel_lighting', name: 'Panel floodlighting & instrument backlighting', desc: 'Controls overall cockpit panel illumination levels' },

  // Brakes
  { id: 'autobrake', name: 'Autobrake selector', desc: 'Sets automatic braking level for landing or rejected takeoff' },
  { id: 'parking_brake', name: 'Parking brake', desc: 'Applies mechanical brake to hold aircraft stationary on ground' },
  { id: 'brake_controls', name: 'Brake system controls', desc: 'Anti-skid selector and brake pressure monitoring' },

  // Display Management
  { id: 'display_page', name: 'System display page selector', desc: 'Selects which aircraft system is shown on the lower ECAM/EICAS display' },
  { id: 'display_bright', name: 'Display brightness control', desc: 'Adjusts brightness of primary flight, navigation, and system displays' },
  { id: 'display_source', name: 'Display source selector / reversion', desc: 'Switches display data source in case of screen or computer failure' },

  // Surveillance & Safety
  { id: 'gpws', name: 'GPWS mode selector', desc: 'Controls ground proximity warning system inhibit modes' },
  { id: 'windshear', name: 'Windshear detection selector', desc: 'Activates or inhibits predictive windshear alerting' },
  { id: 'elt', name: 'Emergency locator transmitter (ELT) selector', desc: 'Manually activates the ELT distress beacon' },

  // Emergency
  { id: 'ditching', name: 'Ditching selector', desc: 'Closes all below-waterline openings for water landing' },
  { id: 'evac_signal', name: 'Emergency evacuation signal', desc: 'Sounds evacuation alarm and alerts cabin crew' },
  { id: 'cabin_signs', name: 'Cabin signs panel', desc: 'Controls seat belt and no smoking signs throughout cabin' },
  { id: 'emer_lighting', name: 'Emergency lighting selector', desc: 'Arms or activates emergency floor path and exit lighting' },
  { id: 'rat', name: 'Ram air turbine (RAT) deployment', desc: 'Deploys wind-driven emergency hydraulic and electrical generator' },
  { id: 'smoke_panel', name: 'Smoke detection & extraction panel', desc: 'Smoke detection alerts and ventilation isolation for cargo and avionics bays' },

  // Displays
  { id: 'pfd', name: 'Primary Flight Display (PFD)', desc: 'Shows attitude, airspeed, altitude, vertical speed, and flight mode annunciations' },
  { id: 'nd', name: 'Navigation Display (ND)', desc: 'Shows navigation map, weather radar, traffic, and flight plan' },
  { id: 'standby_display', name: 'Standby instrument display', desc: 'Backup display for attitude, airspeed, and altitude in case of primary display failure' },
  { id: 'upper_ecam', name: 'Upper ECAM / EICAS display', desc: 'Shows primary engine parameters and active warnings' },
  { id: 'lower_ecam', name: 'Lower ECAM / EICAS display', desc: 'Shows aircraft systems synoptic pages and status messages' },
  { id: 'isis', name: 'Integrated standby instrument system (ISIS)', desc: 'Self-contained backup display for attitude and airspeed, independently powered' },
  { id: 'fms_cdu', name: 'FMS / CDU display', desc: 'Dedicated screen and keyboard for flight management system entry and review' },
  { id: 'ecl', name: 'Electronic checklist display', desc: 'Screen showing normal and abnormal procedure checklists' },
]

