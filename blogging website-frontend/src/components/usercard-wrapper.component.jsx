import AnimationWrapper from "../common/page-animation";
import Loader from "./loader.component";
import NoDataMessage from "./nodata.component";
import UserCard from "./usercard.component";

const UserCardWrapper = ({ data }) => {
  const users = data;

  return (
    <>
      {users === null ? (
        <Loader />
      ) : users.length ? (
        users.map((user, index) => {
          return (
            <AnimationWrapper
              key={index}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <UserCard user={user} />
            </AnimationWrapper>
          );
        })
      ) : (
        <NoDataMessage message="No user found" />
      )}
    </>
  );
};

export default UserCardWrapper;
