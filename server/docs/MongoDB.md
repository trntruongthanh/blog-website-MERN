Query Methods:
| Method                                     | Ý nghĩa                                                 | Ví dụ                                                              |
| ------------------------------------------ | ------------------------------------------------------- | ------------------------------------------------------------------ |
| `find(query)`                              | Trả về **nhiều document** khớp với query.               | `User.find({ age: { $gte: 18 } })`                                 |
| `findOne(query)`                           | Trả về **một document đầu tiên** khớp query.            | `User.findOne({ email: "abc@gmail.com" })`                         |
| `findById(id)`                             | Tìm document theo `_id`.                                | `User.findById("650ff9e4...")`                                     |
| `findByIdAndUpdate(id, update, options)`   | Tìm document theo `_id` và update.                      | `User.findByIdAndUpdate(id, { $set: { age: 30 } }, { new: true })` |
| `findOneAndUpdate(query, update, options)` | Tìm document theo query và update.                      | `User.findOneAndUpdate({ name: "Alice" }, { $inc: { views: 1 } })` |
| `findByIdAndDelete(id)`                    | Xóa document theo `_id`.                                | `User.findByIdAndDelete(id)`                                       |
| `findOneAndDelete(query)`                  | Xóa document đầu tiên khớp query.                       | `User.findOneAndDelete({ name: "Alice" })`                         |
| `deleteOne(query)`                         | Xóa **1 document** khớp query.                          | `User.deleteOne({ name: "Alice" })`                                |
| `deleteMany(query)`                        | Xóa **nhiều document** khớp query.                      | `User.deleteMany({ isActive: false })`                             |
| `updateOne(query, update)`                 | Update **1 document** khớp query.                       | `User.updateOne({ name: "Alice" }, { $set: { age: 25 } })`         |
| `updateMany(query, update)`                | Update **nhiều document** khớp query.                   | `User.updateMany({ city: "Hanoi" }, { $set: { country: "VN" } })`  |
| `countDocuments(query)`                    | Đếm số lượng document khớp query.                       | `User.countDocuments({ city: "Hanoi" })`                           |
| `distinct(field, query)`                   | Lấy danh sách **giá trị duy nhất** của 1 field.         | `User.distinct("city")`                                            |
| `sort({ field: 1/-1 })`                    | Sắp xếp kết quả (1 = tăng dần, -1 = giảm dần).          | `User.find().sort({ age: -1 })`                                    |
| `limit(n)`                                 | Giới hạn số lượng document trả về.                      | `User.find().limit(10)`                                            |
| `skip(n)`                                  | Bỏ qua n document đầu tiên (thường dùng để phân trang). | `User.find().skip(10).limit(10)`                                   |
| `select(fields)`                           | Chỉ lấy một số field nhất định.                         | `User.find().select("name email")`                                 |
| `lean()`                                   | Trả về plain JS object (không phải Mongoose Document).  | `User.find().lean()`                                               |
| `populate(field)`                          | Join sang collection khác (theo ref).                   | `Blog.find().populate("author")`                                   |


=======================================================================================================================================================================================


Operators:
| Toán tử | Ý nghĩa                          | Ví dụ                            |
| ------- | -------------------------------- | -------------------------------- |
| `$eq`   | Bằng (=)                         | `{ age: { $eq: 18 } }`           |
| `$ne`   | Khác (!=)                        | `{ age: { $ne: 18 } }`           |
| `$gt`   | Lớn hơn                          | `{ age: { $gt: 18 } }`           |
| `$gte`  | Lớn hơn hoặc bằng                | `{ age: { $gte: 18 } }`          |
| `$lt`   | Nhỏ hơn                          | `{ age: { $lt: 18 } }`           |
| `$lte`  | Nhỏ hơn hoặc bằng                | `{ age: { $lte: 18 } }`          |
| `$in`   | Giá trị nằm trong mảng           | `{ age: { $in: [18, 20, 25] } }` |
| `$nin`  | Giá trị **không** nằm trong mảng | `{ age: { $nin: [18, 20] } }`    |


| Toán tử | Ý nghĩa                           | Ví dụ                                                   |
| ------- | --------------------------------- | ------------------------------------------------------- |
| `$and`  | Tất cả điều kiện đều đúng (AND)   | `{ $and: [ { age: { $gt: 18 } }, { city: "Hanoi" } ] }` |
| `$or`   | Một trong các điều kiện đúng (OR) | `{ $or: [ { age: { $lt: 18 } }, { city: "Hanoi" } ] }`  |
| `$nor`  | Không thuộc bất kỳ điều kiện nào  | `{ $nor: [ { age: 18 }, { city: "Hanoi" } ] }`          |
| `$not`  | Phủ định một điều kiện            | `{ age: { $not: { $gt: 30 } } }`                        |


Toán tử phần tử (Element Operators)
| Toán tử   | Ý nghĩa                          | Ví dụ                          |
| --------- | -------------------------------- | ------------------------------ |
| `$exists` | Kiểm tra trường có tồn tại không | `{ email: { $exists: true } }` |
| `$type`   | Kiểm tra kiểu dữ liệu            | `{ age: { $type: "number" } }` |


Toán tử đánh giá (Evaluation Operators)
| Toán tử  | Ý nghĩa                                   | Ví dụ                                        |
| -------- | ----------------------------------------- | -------------------------------------------- |
| `$regex` | So khớp chuỗi với biểu thức chính quy     | `{ name: { $regex: "^A" } }`                 |
| `$expr`  | So sánh giá trị giữa các trường trong doc | `{ $expr: { $gt: ["$spent", "$budget"] } }`  |
| `$mod`   | Chia lấy dư                               | `{ age: { $mod: [5, 0] } }` (chia hết cho 5) |
| `$text`  | Tìm kiếm văn bản toàn văn (full-text)     | `{ $text: { $search: "coffee" } }`           |
| `$where` | Chạy biểu thức JS (ít dùng, kém an toàn)  | `{ $where: "this.age > this.score" }`        |


| Toán tử   | Ý nghĩa                                  | Ví dụ                                 |
| --------- | ---------------------------------------- | ------------------------------------- |
| `$set`    | Gán giá trị cho trường (tạo nếu chưa có) | `{ $set: { age: 30 } }`               |
| `$unset`  | Xóa trường                               | `{ $unset: { age: "" } }`             |
| `$rename` | Đổi tên trường                           | `{ $rename: { "fullname": "name" } }` |


| Toán tử | Ý nghĩa                                       | Ví dụ                      |
| ------- | --------------------------------------------- | -------------------------- |
| `$inc`  | Tăng/giảm giá trị số                          | `{ $inc: { views: 1 } }`   |
| `$mul`  | Nhân giá trị số                               | `{ $mul: { price: 1.1 } }` |
| `$min`  | Chỉ cập nhật nếu giá trị mới nhỏ hơn hiện tại | `{ $min: { score: 50 } }`  |
| `$max`  | Chỉ cập nhật nếu giá trị mới lớn hơn hiện tại | `{ $max: { score: 90 } }`  |


| Toán tử         | Ý nghĩa                                     | Ví dụ                                       |
| --------------- | ------------------------------------------- | ------------------------------------------- |
| `$push`         | Thêm phần tử vào mảng                       | `{ $push: { tags: "newTag" } }`             |
| `$push + $each` | Thêm nhiều phần tử                          | `{ $push: { tags: { $each: ["a","b"] } } }` |
| `$addToSet`     | Thêm phần tử nếu chưa tồn tại               | `{ $addToSet: { tags: "uniqueTag" } }`      |
| `$pop`          | Xóa phần tử đầu (`-1`) hoặc cuối (`1`) mảng | `{ $pop: { tags: 1 } }`                     |
| `$pull`         | Xóa phần tử khớp với điều kiện              | `{ $pull: { tags: "oldTag" } }`             |
| `$pullAll`      | Xóa nhiều phần tử chỉ định                  | `{ $pullAll: { tags: ["a","b"] } }`         |


| Toán tử        | Ý nghĩa                                  |
| -------------- | ---------------------------------------- |
| `$currentDate` | Gán ngày/giờ hiện tại cho trường         |
| `$setOnInsert` | Gán giá trị khi insert (dùng với upsert) |


==================================================================================================================


Cursor / Chain Methods
| Method            | Công dụng                                             |
| ----------------- | ----------------------------------------------------- |
| `.limit(n)`       | Giới hạn số document trả về                           |
| `.skip(n)`        | Bỏ qua `n` document đầu tiên                          |
| `.sort(obj)`      | Sắp xếp kết quả (`1` tăng dần, `-1` giảm dần)         |
| `.select(fields)` | Chỉ lấy field chỉ định                                |
| `.project(obj)`   | (MongoDB native) chọn field trả về                    |
| `.count()`        | Đếm (MongoDB cũ, nên dùng `countDocuments`)           |
| `.populate()`     | (Mongoose) join sang collection khác qua `ref`        |
| `.lean()`         | Trả về plain JS object (không phải Mongoose Document) |
