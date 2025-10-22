import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  movimentacoes: router({
    getRubricas: publicProcedure.query(async () => {
      try {
        const { createClient } = await import("@supabase/supabase-js");
        const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://ozupsbdusywukrteefqc.supabase.co";
        const supabaseKey = process.env.VITE_SUPABASE_KEY || "";

        if (!supabaseUrl || !supabaseKey) {
          return [];
        }

        const supabase = createClient(supabaseUrl, supabaseKey);
        const { data } = await supabase
          .from("dmovimentacoes")
          .select("rubrica")
          .order("rubrica", { ascending: true });

        const uniqueRubricas = Array.from(
          new Set((data || []).map((m: any) => m.rubrica).filter(Boolean))
        ).sort();
        return uniqueRubricas as string[];
      } catch (error) {
        console.error("Error fetching rubricas:", error);
        return [];
      }
    }),
  }),
});

export type AppRouter = typeof appRouter;

