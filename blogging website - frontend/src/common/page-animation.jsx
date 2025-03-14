import { AnimatePresence, motion } from "framer-motion";

/*
  <AnimatePresence>:
  Đảm bảo rằng khi keyValue thay đổi, phần tử cũ bị loại bỏ sẽ có animation thoát (exit animation).
  Nếu không dùng AnimatePresence, khi keyValue thay đổi, phần tử sẽ bị thay thế ngay lập tức mà không có hiệu ứng.

  <motion.div>:
  key={keyValue}: Khi keyValue thay đổi, motion.div sẽ render lại và chạy animation mới.

  motion: Cung cấp các phần tử HTML có hỗ trợ animation, ví dụ: <motion.div>, <motion.button>, v.v.
  AnimatePresence: Cho phép tạo animation khi phần tử bị loại khỏi DOM (thoát khỏi giao diệ
*/

const AnimationWrapper = ({
  children,
  keyValue,
  className,
  initial = { opacity: 0 },
  animate = { opacity: 1 },
  transition = { duration: 1 },
}) => {
  return (
    <AnimatePresence>
      <motion.div
        key={keyValue}
        className={className}
        initial={initial}
        animate={animate}
        transition={transition}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default AnimationWrapper;
