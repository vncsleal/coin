import Image from "next/image";

export default function MobileSplashScreen() {
  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-50 md:hidden">
      <Image
        src="https://l3pden50fc.ufs.sh/f/qVxhWi9olDGtv7HTLkPK2ApQTwchMHEZ8OIegU6XizFlkxf4"
        alt="Cutia Logo"
        width={128}
        height={128}
        className="mb-4 animate-bounce" // Added a small animation for splash effect
      />
      <h1 className="text-5xl font-bold tracking-tight flex items-center gap-2">
        Cutia
        <span className="text-base font-medium bg-primary/10 text-primary px-3 py-1 rounded-full align-middle ml-2">beta</span>
      </h1>
      <p className="text-lg text-muted-foreground mt-4">Carregando...</p>
    </div>
  );
}
