/**
 * Runs the European Commission's public calculator script and reads its report.
 *
 * Source: https://ec.europa.eu/assets/home/visa-calculator/calculator.htm
 * The calculation lives in the second inline script (`leggInndager`, `Beregn2`,
 * `BeregnControl`, `BeregnVisa`). This module does not reimplement those
 * functions; it executes the script that was loaded. If the HTML cannot be
 * parsed as that calculator, callers must report "couldn't verify".
 */

import vm from "node:vm";
import { toCommissionDate, type IsoDate } from "./dates";
import type { StayInput } from "./engine";

export const COMMISSION_CALCULATOR_URL =
  "https://ec.europa.eu/assets/home/visa-calculator/calculator.htm";

type Mode = "planning" | "control";

type FakeElement = {
  id: string;
  value: string;
  innerHTML: string;
  checked: boolean;
  style: Record<string, string>;
  children: FakeElement[];
  setAttribute: () => void;
  appendChild: (child: FakeElement) => void;
};

function makeElement(id: string): FakeElement {
  const element: FakeElement = {
    id,
    value: "",
    innerHTML: "",
    checked: false,
    style: {},
    children: [],
    setAttribute() {},
    appendChild(child) {
      this.children.push(child);
    },
  };
  return element;
}

export class CommissionSourceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CommissionSourceError";
  }
}

type CalculatorSandbox = {
  fncCalculate: () => void;
  setup: () => void;
};

function loadCalculator(html: string): {
  run: (stays: StayInput[], on: IsoDate, mode: Mode) => string[];
} {
  if (!html.includes("function Beregn2") || !html.includes("function leggInndager")) {
    throw new CommissionSourceError(
      "The downloaded page does not contain the Commission calculator functions.",
    );
  }
  const scripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map(
    (match) => match[1],
  );
  if (scripts.length < 2) {
    throw new CommissionSourceError("The Commission page did not include its calculator script.");
  }

  const elements = new Map<string, FakeElement>();
  const document = {
    getElementById(id: string) {
      let element = elements.get(id);
      if (!element) {
        element = makeElement(id);
        elements.set(id, element);
      }
      return element;
    },
    createElement() {
      return makeElement("node");
    },
  };

  function $(selector: unknown) {
    if (selector === document) {
      return { ready(callback: () => void) { callback(); } };
    }
    const id = String(selector).replace(/^#/, "");
    const element = document.getElementById(id);
    const api = {
      attr() { return api; },
      click() { return api; },
      change() { return api; },
      html(value?: string) {
        if (value !== undefined) {
          element.innerHTML = value;
          return api;
        }
        return element.innerHTML;
      },
      text(value?: string) {
        if (value !== undefined) {
          element.innerHTML = value;
          return api;
        }
        return element.innerHTML;
      },
      css() { return "80"; },
    };
    return api;
  }
  $.url = () => ({ param: () => "en" });
  $.inArray = (item: string, list: string[]) => list.indexOf(item);
  $.each = (list: unknown[], callback: (index: number, value: unknown) => void) => {
    list.forEach((value, index) => callback(index, value));
  };

  const sandbox: Record<string, unknown> = {
    document,
    console,
    alert() {},
    confirm() { return false; },
    $,
  };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  try {
    vm.runInContext(scripts[0], sandbox);
    vm.runInContext(scripts[1], sandbox);
    (sandbox as CalculatorSandbox).setup();
  } catch (error) {
    throw new CommissionSourceError(
      `The Commission calculator script failed to load (${error instanceof Error ? error.message : "unknown error"}).`,
    );
  }

  return {
    run(stays, on, mode) {
      elements.clear();
      (sandbox as CalculatorSandbox).setup();
      document.getElementById("altVisa").checked = mode === "planning";
      document.getElementById("altControl").checked = mode === "control";
      document.getElementById("TxtField").value = toCommissionDate(on);
      stays.forEach((stay, index) => {
        if (stay.exit === null) {
          throw new CommissionSourceError("The reference calculator requires an exit date for every stay.");
        }
        document.getElementById(`fra${index}`).value = toCommissionDate(stay.entry);
        document.getElementById(`til${index}`).value = toCommissionDate(stay.exit);
      });
      try {
        (sandbox as CalculatorSandbox).fncCalculate();
      } catch (error) {
        throw new CommissionSourceError(
          `The Commission calculator failed while calculating (${error instanceof Error ? error.message : "unknown error"}).`,
        );
      }
      return document
        .getElementById("report")
        .children.map((child) => child.innerHTML.replace(/<[^>]+>/g, "").trim())
        .filter((line) => line.length > 0);
    },
  };
}

export type CommissionRun = {
  control: string[];
  planning: string[];
};

export function runCommissionScenario(
  html: string,
  stays: StayInput[],
  on: IsoDate,
): CommissionRun {
  // A fresh script context per mode. The calculator keeps stay arrays and the
  // rolling-window buffers on the page, and a second calculation would reuse them.
  return {
    control: loadCalculator(html).run(stays, on, "control"),
    planning: loadCalculator(html).run(stays, on, "planning"),
  };
}

export async function fetchCommissionCalculator(timeoutMs = 15_000): Promise<string> {
  const response = await fetch(COMMISSION_CALCULATOR_URL, {
    cache: "no-store",
    signal: AbortSignal.timeout(timeoutMs),
    headers: { "User-Agent": "Ninety/0.1 (parity check; +https://ninety-coral.vercel.app)" },
  });
  if (!response.ok) {
    throw new CommissionSourceError(`Commission calculator responded with HTTP ${response.status}.`);
  }
  return response.text();
}
