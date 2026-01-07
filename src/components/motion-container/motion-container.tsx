import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";

type Props = {
  // isVisible: boolean;
  // animationValues: [boolean, boolean | undefined, boolean?];
  children: ReactNode;
};

export function MotionContainer({ children }: Props) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        exit={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        // className={motionConfig.className}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
