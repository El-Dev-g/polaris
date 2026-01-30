import { ShieldAlertIcon } from "lucide-react";

import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

export const UnauthenticatedView = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-background">
      <div className="w-full max-w-lg bg-muted">
        <Item variant="outline">
          <ItemMedia variant="icon">
            <ShieldAlertIcon />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Unauthorized Access</ItemTitle>
            <ItemDescription>
              You are not authorized to access this resource.
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button variant="outline" size="sm" onClick={() => signIn("github")}>
              Sign in
            </Button>
          </ItemActions>
        </Item>
      </div>
    </div>
  );
};
