import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import DOMPurify from "dompurify";
import FileUpload from "../FileUpload";
import api from "../../services/api"; // 👈 adjust path if needed

// --- Mock the API ---
jest.mock("../../services/api", () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

const queryClient = new QueryClient();

describe("FileUpload Component", () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Default: mock API.get to resolve with a fake public key
    (api.get as jest.Mock).mockResolvedValue({
      data: { publicKey: "fake-public-key" },
    });
  });

  test("sanitizes filename input to remove malicious code", () => {
    const maliciousInput = '<script>alert("XSS")</script>safe-text';
    const expectedSafe = "safe-text";

    const sanitized = DOMPurify.sanitize(maliciousInput);
    expect(sanitized).toBe(expectedSafe);
  });

  test("handles file change and sanitizes filename in component", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <FileUpload />
      </QueryClientProvider>
    );

    // Now that API mock resolves, the file input should render
    const fileInput = (await screen.findByTestId(
      "file-input"
    )) as HTMLInputElement;

    const mockFile = new File(["content"], "<script>evil</script>.txt", {
      type: "text/plain",
    });

    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    const displayedFilename = await screen.findByTestId("filename-display");
    expect((displayedFilename as HTMLInputElement).value).toBe(".txt");
  });
});
