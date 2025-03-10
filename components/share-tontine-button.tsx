"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ShareTontineButtonProps {
  tontineId: string;
  isPrivate?: boolean;
}

export default function ShareTontineButton({
  tontineId,
  isPrivate = false,
}: ShareTontineButtonProps) {
  const { toast } = useToast();
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    setIsSharing(true);
    try {
      // Construct the share URL
      const shareUrl = `${window.location.origin}/dashboard/tontine/${tontineId}`;

      // Try to use the native share API first
      if (navigator.share) {
        await navigator.share({
          title: "Rejoindre la Tontine",
          text: "Rejoignez notre tontine !",
          url: shareUrl,
        });
        toast({
          title: "Partagé",
          description: "Le lien a été partagé avec succès.",
        });
      } else {
        // Fallback to clipboard copy
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Lien Copié",
          description: "Le lien a été copié dans le presse-papiers.",
        });
      }
    } catch (error) {
      console.error("Erreur lors du partage:", error);
      toast({
        title: "Erreur",
        description: "Impossible de partager le lien. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };

  if (isPrivate) {
    return null;
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="border-tontine-primary text-tontine-primary hover:bg-tontine-primary/10"
      onClick={handleShare}
      disabled={isSharing}
    >
      <Share2 className="mr-2 h-4 w-4" />
      {isSharing ? "Partage en cours..." : "Partager"}
    </Button>
  );
}
