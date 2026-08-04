import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@/testing/testUtils";
import { EmptyState } from "../EmptyState";

describe("EmptyState Component", () => {
  it("renders title and description correctly", () => {
    render(
      <EmptyState
        title="No Data Found"
        description="Try adjusting your search criteria."
      />
    );

    expect(screen.getByText("No Data Found")).toBeInTheDocument();
    expect(screen.getByText("Try adjusting your search criteria.")).toBeInTheDocument();
  });

  it("renders action button and triggers callback on click", () => {
    const handleAction = vi.fn();
    render(
      <EmptyState
        title="Empty List"
        actionLabel="Create Item"
        onAction={handleAction}
      />
    );

    const button = screen.getByRole("button", { name: "Create Item" });
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    expect(handleAction).toHaveBeenCalledTimes(1);
  });
});
