import "@testing-library/jest-dom";

import { setNavigation } from "./__tests__/navigation-mock";

jest.mock("next/navigation", () => jest.requireActual("./__tests__/navigation-mock"));

afterEach(() => {
  if (typeof window !== "undefined") {
    window.localStorage.clear();
    window.sessionStorage.clear();
  }
  setNavigation({});
  jest.clearAllMocks();
});
