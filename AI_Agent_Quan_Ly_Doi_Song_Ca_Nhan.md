# AI AGENT SPECIFICATION
# Đề tài: Nghiên cứu và xây dựng hệ thống quản lý đời sống cá nhân trên nền tảng web

> Tài liệu yêu cầu dành cho AI Agent hỗ trợ phân tích, thiết kế và phát triển một website quản lý đời sống cá nhân hoàn chỉnh.
> 
> **Yêu cầu quan trọng:** Xây dựng một ứng dụng web có nhiều trang, nhiều chức năng, có điều hướng và luồng dữ liệu thực tế. Không được chỉ tạo một landing page hoặc một giao diện dashboard tĩnh. Các nút, biểu mẫu, bộ lọc, thao tác thêm/sửa/xóa và các chức năng được mô tả phải hoạt động thực sự.

---

## 1. Tổng quan dự án

### 1.1. Tên đề tài
**Nghiên cứu và xây dựng hệ thống quản lý đời sống cá nhân trên nền tảng web.**

### 1.2. Mục đích
Xây dựng một hệ thống web giúp người dùng quản lý tập trung các hoạt động thường ngày, bao gồm công việc, lịch trình, mục tiêu, thói quen, ghi chú và tài chính cá nhân. Hệ thống cung cấp dashboard tổng quan, nhắc nhở và các thống kê để người dùng theo dõi tiến độ, sử dụng thời gian hợp lý và hiểu rõ hơn về thói quen chi tiêu.

### 1.3. Đối tượng sử dụng
- **Người dùng cá nhân:** Sinh viên, người đi làm hoặc bất kỳ ai muốn tổ chức cuộc sống cá nhân.
- **Quản trị viên (Admin):** Quản lý người dùng và giám sát hoạt động vận hành của hệ thống.
- **AI Assistant:** Thành phần trợ lý thông minh hỗ trợ phân tích dữ liệu mà người dùng cho phép, trả lời câu hỏi và đưa ra gợi ý tham khảo. Đây là thành phần hỗ trợ, không phải tài khoản người dùng độc lập.

### 1.4. Phạm vi
- Ứng dụng web responsive, sử dụng được trên máy tính bảng và điện thoại.
- Phiên bản đầu tập trung vào nền tảng web; không yêu cầu phát triển ứng dụng di động native.
- Dữ liệu của mỗi tài khoản phải được phân tách, bảo vệ và chỉ được truy cập theo quyền hợp lệ.
- AI chỉ đưa ra gợi ý dựa trên dữ liệu được cấp quyền; không tự ý sửa hoặc xóa dữ liệu nếu chưa có xác nhận của người dùng.

---

## 2. Các tác nhân (Actors)

### 2.1. Khách chưa đăng nhập
**Mục đích:** Truy cập các chức năng công khai và tạo tài khoản.

**Quyền/chức năng:**
- Xem trang giới thiệu hệ thống.
- Đăng ký tài khoản.
- Đăng nhập.
- Yêu cầu đặt lại mật khẩu.
- Xem chính sách quyền riêng tư và điều khoản sử dụng.

**Giới hạn:** Không được xem dashboard hoặc dữ liệu cá nhân khi chưa đăng nhập.

### 2.2. Người dùng cá nhân
**Mục đích:** Quản lý các khía cạnh của đời sống cá nhân trong một nơi duy nhất.

**Quyền/chức năng:**
- Quản lý hồ sơ cá nhân và cài đặt.
- Quản lý công việc, lịch trình và sự kiện.
- Quản lý mục tiêu và thói quen.
- Quản lý thu nhập, chi tiêu và ngân sách.
- Tạo ghi chú và danh sách việc cần làm.
- Nhận thông báo, nhắc nhở.
- Xem dashboard, báo cáo và thống kê.
- Sử dụng AI Assistant khi tính năng được bật.
- Xuất dữ liệu cá nhân và yêu cầu xóa tài khoản theo chính sách hệ thống.

**Giới hạn:** Chỉ được truy cập dữ liệu thuộc tài khoản của mình.

### 2.3. Quản trị viên (Admin)
**Mục đích:** Quản lý hoạt động và bảo đảm hệ thống vận hành an toàn.

**Quyền/chức năng:**
- Đăng nhập khu vực quản trị.
- Xem dashboard quản trị với số liệu tổng hợp.
- Xem danh sách tài khoản, tìm kiếm và lọc người dùng.
- Khóa/mở khóa tài khoản theo quy trình được quy định.
- Quản lý vai trò và quyền truy cập.
- Xem nhật ký hệ thống và các sự kiện bảo mật cần thiết.
- Quản lý cấu hình chung, danh mục dùng chung và nội dung hỗ trợ.
- Theo dõi trạng thái dịch vụ, lỗi hệ thống và phản hồi người dùng.

**Giới hạn:** Không được xem nội dung riêng tư như ghi chú, giao dịch tài chính hoặc lịch cá nhân của người dùng nếu không có cơ sở quyền hạn rõ ràng và được ghi nhận. Không lưu mật khẩu dạng văn bản thuần.

### 2.4. AI Assistant
**Mục đích:** Hỗ trợ người dùng hiểu dữ liệu và lập kế hoạch tốt hơn.

**Chức năng:**
- Trả lời câu hỏi về cách sử dụng ứng dụng.
- Tóm tắt công việc và lịch trình dựa trên dữ liệu được người dùng cho phép.
- Gợi ý sắp xếp công việc theo hạn hoàn thành và mức độ ưu tiên.
- Hỗ trợ chia mục tiêu lớn thành các bước nhỏ.
- Phân tích xu hướng hoàn thành thói quen.
- Tổng hợp thu nhập, chi tiêu và so sánh ngân sách theo kỳ.
- Đưa ra gợi ý tham khảo để cải thiện việc quản lý thời gian và chi tiêu.
- Giải thích căn cứ của gợi ý khi có thể, đồng thời nêu rõ giới hạn dữ liệu.

**Giới hạn và nguyên tắc:**
- Không bịa dữ liệu hoặc khẳng định đã thực hiện thao tác khi chưa thực sự thực hiện.
- Không tự ý tạo, sửa, hoàn thành hoặc xóa dữ liệu nếu chưa có xác nhận của người dùng.
- Không dùng dữ liệu của người này để trả lời cho người khác.
- Không coi gợi ý tài chính hoặc sức khỏe là lời khuyên chuyên môn.
- Cho phép người dùng tắt tính năng AI và kiểm soát dữ liệu được chia sẻ với AI.
- Nếu chưa tích hợp API AI, xây dựng giao diện và lớp dịch vụ theo kiến trúc có thể tích hợp sau; phải ghi rõ chức năng nào đang là bản mô phỏng.

### 2.5. Dịch vụ hệ thống (tác nhân phụ trợ)
Có thể gồm dịch vụ gửi email, dịch vụ thông báo và nhà cung cấp AI bên ngoài. Các dịch vụ này không phải người dùng trực tiếp nhưng tham gia các luồng xử lý khi được cấu hình.

---

## 3. Danh sách chức năng theo phân hệ

### 3.1. Xác thực và tài khoản
- Đăng ký bằng họ tên, email và mật khẩu.
- Kiểm tra định dạng email, độ mạnh mật khẩu và email trùng lặp.
- Đăng nhập, đăng xuất.
- Mã hóa mật khẩu an toàn bằng thuật toán băm chuyên dụng.
- Xác thực phiên đăng nhập bằng cookie bảo mật hoặc access token phù hợp.
- Quên mật khẩu và đặt lại mật khẩu qua quy trình an toàn.
- Cập nhật hồ sơ: ảnh đại diện, họ tên, email và thông tin cơ bản.
- Đổi mật khẩu.
- Cài đặt ngôn ngữ, múi giờ, định dạng ngày giờ và tùy chọn thông báo.
- Yêu cầu xuất dữ liệu hoặc xóa tài khoản.

### 3.2. Dashboard tổng quan
- Hiển thị lời chào và ngày hiện tại.
- Hiển thị số công việc cần làm, công việc quá hạn và công việc đã hoàn thành.
- Hiển thị lịch trình/sự kiện sắp tới.
- Hiển thị tiến độ mục tiêu và thói quen.
- Hiển thị tổng thu nhập, chi tiêu và số dư theo khoảng thời gian được chọn.
- Hiển thị biểu đồ và thống kê ngắn gọn.
- Hiển thị ghi chú gần đây và nhắc nhở sắp đến hạn.
- Có bộ lọc theo ngày, tuần, tháng hoặc khoảng thời gian tùy phân hệ.
- Các thẻ thống kê phải liên kết đến trang chi tiết tương ứng; không chỉ là hình ảnh trang trí.

### 3.3. Quản lý công việc (Tasks)
- Tạo công việc với tiêu đề, mô tả, ngày đến hạn, mức ưu tiên, trạng thái và danh mục.
- Xem danh sách công việc.
- Sửa và xóa công việc.
- Đánh dấu hoàn thành hoặc mở lại công việc.
- Lọc theo trạng thái, mức ưu tiên, danh mục và thời hạn.
- Tìm kiếm công việc.
- Sắp xếp theo hạn, mức ưu tiên hoặc ngày tạo.
- Xem công việc hôm nay, sắp tới, quá hạn và đã hoàn thành.
- Hỗ trợ chế độ danh sách; có thể bổ sung chế độ bảng Kanban.
- Nhắc nhở trước thời hạn nếu người dùng bật thông báo.

### 3.4. Lịch trình và sự kiện (Calendar)
- Xem lịch theo tháng, tuần và ngày.
- Tạo sự kiện với tiêu đề, mô tả, thời gian bắt đầu/kết thúc và địa điểm tùy chọn.
- Sửa, xóa sự kiện.
- Phát hiện thời gian kết thúc trước thời gian bắt đầu.
- Hiển thị sự kiện sắp tới trên dashboard.
- Liên kết công việc với ngày đến hạn nếu phù hợp.
- Thiết lập nhắc nhở trước sự kiện.
- Xử lý múi giờ nhất quán.

### 3.5. Quản lý mục tiêu (Goals)
- Tạo mục tiêu với tên, mô tả, danh mục, ngày bắt đầu, hạn hoàn thành và trạng thái.
- Chia mục tiêu thành các mốc hoặc bước nhỏ.
- Cập nhật tiến độ theo phần trăm hoặc theo các bước đã hoàn thành.
- Sửa, lưu trữ hoặc xóa mục tiêu.
- Xem danh sách mục tiêu đang thực hiện, hoàn thành và quá hạn.
- Hiển thị tiến độ bằng thanh tiến trình.
- Gợi ý kế hoạch thực hiện mục tiêu bằng AI nếu được bật.

### 3.6. Quản lý thói quen (Habits)
- Tạo thói quen với tên, mô tả, tần suất và ngày bắt đầu.
- Hỗ trợ tần suất hằng ngày hoặc chọn các ngày trong tuần.
- Đánh dấu đã thực hiện theo ngày.
- Bỏ đánh dấu nếu ghi nhận nhầm.
- Xem lịch sử thực hiện.
- Tính chuỗi ngày liên tục (streak) theo quy tắc nhất quán.
- Thống kê tỷ lệ hoàn thành theo tuần/tháng.
- Nhắc nhở thực hiện thói quen theo cài đặt.
- Không sử dụng thống kê để gây áp lực hoặc phán xét người dùng.

### 3.7. Quản lý tài chính cá nhân
- Quản lý danh mục thu nhập và chi tiêu.
- Tạo giao dịch gồm loại giao dịch, số tiền, danh mục, ngày, ghi chú và phương thức thanh toán tùy chọn.
- Xem, sửa và xóa giao dịch.
- Tìm kiếm, lọc theo loại, danh mục và khoảng thời gian.
- Tạo ngân sách theo danh mục và tháng.
- So sánh chi tiêu thực tế với ngân sách.
- Thống kê thu nhập, chi tiêu, chênh lệch và xu hướng theo kỳ.
- Hiển thị biểu đồ theo danh mục và theo thời gian.
- Cảnh báo khi gần đạt hoặc vượt ngân sách theo cấu hình.
- Kiểm tra số tiền là số hợp lệ và lớn hơn 0.
- Lưu tiền bằng kiểu dữ liệu số chính xác phù hợp; không dùng số thực nhị phân một cách thiếu kiểm soát cho phép tính tiền.
- Không kết nối tài khoản ngân hàng hoặc thực hiện thanh toán thật trong phạm vi mặc định.

### 3.8. Ghi chú (Notes)
- Tạo ghi chú với tiêu đề, nội dung, thời gian tạo và cập nhật.
- Xem, sửa và xóa ghi chú.
- Tìm kiếm theo tiêu đề/nội dung.
- Ghim ghi chú quan trọng.
- Lọc ghi chú đã ghim và ghi chú gần đây.
- Có thể hỗ trợ nhãn (tags) nếu phù hợp.
- Nội dung ghi chú là dữ liệu riêng tư của người dùng.

### 3.9. Nhắc nhở và thông báo
- Hiển thị danh sách thông báo trong ứng dụng.
- Thông báo cho công việc đến hạn, sự kiện sắp diễn ra, thói quen và ngân sách.
- Đánh dấu đã đọc/chưa đọc.
- Xóa hoặc ẩn thông báo.
- Cấu hình loại thông báo được nhận.
- Nếu tích hợp email hoặc thông báo đẩy, cần cấu hình và kiểm tra dịch vụ gửi thực tế.
- Không hiển thị trạng thái “đã gửi” nếu hệ thống chưa xác nhận gửi thành công.

### 3.10. Báo cáo và thống kê
- Báo cáo hoàn thành công việc theo thời gian.
- Báo cáo tiến độ mục tiêu.
- Báo cáo tỷ lệ duy trì thói quen.
- Báo cáo thu nhập và chi tiêu theo tháng.
- So sánh các kỳ.
- Cho phép chọn khoảng thời gian và danh mục.
- Có thể xuất báo cáo CSV; chỉ triển khai PDF/XLSX nếu có nhu cầu và thư viện phù hợp.
- Mọi số liệu phải được tính từ dữ liệu thực trong cơ sở dữ liệu, không dùng số liệu minh họa cố định ở bản hoàn chỉnh.

### 3.11. AI Assistant
- Giao diện trò chuyện hỏi đáp.
- Đề xuất kế hoạch ngày/tuần dựa trên công việc và lịch trình được cho phép.
- Tóm tắt công việc quá hạn và các việc ưu tiên.
- Gợi ý chia nhỏ mục tiêu.
- Phân tích xu hướng thói quen.
- Tóm tắt thu chi và cảnh báo xu hướng chi tiêu.
- Cho phép người dùng xem hoặc xác nhận trước khi áp dụng thay đổi.
- Hiển thị thông báo khi AI không đủ dữ liệu để kết luận.
- Quản lý lịch sử trò chuyện và cho phép xóa lịch sử.
- Không đưa dữ liệu nhạy cảm vào dịch vụ AI bên ngoài khi chưa có sự đồng ý và cơ chế bảo vệ phù hợp.

### 3.12. Quản trị hệ thống
- Dashboard quản trị với số lượng tài khoản và tình trạng hoạt động tổng hợp.
- Danh sách tài khoản, tìm kiếm và lọc.
- Xem thông tin tài khoản tối thiểu cần thiết.
- Khóa/mở khóa tài khoản và ghi nhật ký thao tác.
- Quản lý vai trò và quyền hạn.
- Quản lý danh mục hoặc cấu hình dùng chung khi cần.
- Xem nhật ký lỗi và sự kiện bảo mật phù hợp.
- Không cho phép admin đọc tùy tiện nội dung cá nhân.
- Các API quản trị phải kiểm tra quyền ở backend, không chỉ ẩn nút trên giao diện.

### 3.13. Trang trợ giúp và cài đặt
- Trang hướng dẫn sử dụng.
- Trang câu hỏi thường gặp.
- Trang liên hệ/gửi phản hồi.
- Cài đặt thông báo, giao diện sáng/tối và tùy chọn cá nhân.
- Trang chính sách quyền riêng tư và điều khoản sử dụng.

---

## 4. Ma trận quyền tác nhân

| Chức năng | Khách | Người dùng | Admin | AI Assistant |
|---|---:|---:|---:|---:|
| Xem trang giới thiệu | Có | Có | Có | Không |
| Đăng ký/đăng nhập | Có | Có | Có | Không |
| Xem/sửa dữ liệu cá nhân | Không | Chỉ dữ liệu của mình | Chỉ thông tin quản trị cần thiết | Chỉ dữ liệu được cấp quyền |
| Quản lý công việc/lịch | Không | Có | Không mặc định | Phân tích/gợi ý theo quyền |
| Quản lý mục tiêu/thói quen | Không | Có | Không mặc định | Phân tích/gợi ý theo quyền |
| Quản lý tài chính | Không | Có | Không mặc định | Tóm tắt theo quyền |
| Ghi chú cá nhân | Không | Có | Không mặc định | Chỉ khi được cấp quyền |
| Quản lý tài khoản người dùng | Không | Tài khoản của mình | Có | Không |
| Xem báo cáo cá nhân | Không | Có | Chỉ số tổng hợp phù hợp | Phân tích theo quyền |
| Cấu hình hệ thống | Không | Không | Có | Không |

---

## 5. Các trang giao diện bắt buộc

AI Agent phải xây dựng đầy đủ các trang sau, có điều hướng hoạt động:

1. **Trang giới thiệu** (`/`)
2. **Đăng ký** (`/register`)
3. **Đăng nhập** (`/login`)
4. **Quên mật khẩu** (`/forgot-password`)
5. **Dashboard người dùng** (`/dashboard`)
6. **Công việc** (`/tasks`)
7. **Lịch trình** (`/calendar`)
8. **Mục tiêu** (`/goals`)
9. **Thói quen** (`/habits`)
10. **Tài chính** (`/finance`)
11. **Ghi chú** (`/notes`)
12. **Thông báo** (`/notifications`)
13. **Báo cáo và thống kê** (`/reports`)
14. **AI Assistant** (`/assistant`)
15. **Hồ sơ cá nhân** (`/profile`)
16. **Cài đặt** (`/settings`)
17. **Trợ giúp/FAQ** (`/help`)
18. **Dashboard quản trị** (`/admin`)
19. **Quản lý tài khoản** (`/admin/users`)
20. **Trang không tìm thấy** (`/404` hoặc trang fallback tương đương)

Có thể điều chỉnh URL theo framework, nhưng phải giữ đủ các nhóm chức năng và trang tương đương.

---

## 6. Luồng nghiệp vụ chính

### 6.1. Luồng người dùng mới
1. Truy cập trang giới thiệu.
2. Mở trang đăng ký và nhập thông tin.
3. Hệ thống xác thực dữ liệu, kiểm tra email trùng.
4. Tạo tài khoản an toàn.
5. Đăng nhập và chuyển đến dashboard.
6. Hướng dẫn người dùng thiết lập công việc, mục tiêu hoặc ngân sách đầu tiên.

### 6.2. Luồng quản lý công việc
1. Người dùng mở trang Công việc.
2. Tạo công việc, nhập hạn và mức ưu tiên.
3. Hệ thống lưu dữ liệu và cập nhật danh sách.
4. Người dùng lọc hoặc sửa công việc.
5. Khi hoàn thành, người dùng đánh dấu hoàn thành.
6. Dashboard và báo cáo cập nhật theo dữ liệu mới.

### 6.3. Luồng ghi nhận chi tiêu
1. Người dùng mở trang Tài chính.
2. Thêm giao dịch chi tiêu.
3. Hệ thống kiểm tra số tiền, danh mục và ngày.
4. Giao dịch được lưu.
5. Tổng chi tiêu, biểu đồ và ngân sách được tính lại.
6. Nếu gần/vượt ngưỡng, hệ thống tạo thông báo theo cài đặt.

### 6.4. Luồng sử dụng AI
1. Người dùng mở AI Assistant.
2. Hệ thống thông báo phạm vi dữ liệu AI sẽ sử dụng.
3. Người dùng nhập câu hỏi hoặc yêu cầu gợi ý.
4. Backend kiểm tra danh tính, quyền và dữ liệu được phép.
5. AI trả lời dựa trên dữ liệu có thật hoặc thông tin người dùng cung cấp.
6. Nếu đề xuất có thay đổi dữ liệu, hiển thị bản xem trước và yêu cầu xác nhận.
7. Ghi nhận lỗi hoặc trạng thái phù hợp; không giả lập thành công.

### 6.5. Luồng quản trị
1. Admin đăng nhập bằng tài khoản có quyền phù hợp.
2. Backend xác minh vai trò.
3. Admin xem dashboard và danh sách tài khoản.
4. Khi khóa/mở khóa tài khoản, hệ thống yêu cầu xác nhận và ghi nhật ký.
5. Mọi thao tác quản trị bị từ chối nếu không đủ quyền.

---

## 7. Yêu cầu phi chức năng

### 7.1. Bảo mật
- Băm mật khẩu bằng bcrypt, Argon2 hoặc giải pháp tương đương.
- Kiểm tra xác thực và phân quyền ở backend trên mọi API riêng tư.
- Người dùng không thể đọc/sửa dữ liệu của tài khoản khác bằng cách đổi ID.
- Xác thực và kiểm tra dữ liệu ở cả frontend lẫn backend.
- Sử dụng biến môi trường cho secret, URI cơ sở dữ liệu và API key.
- Không đưa secret vào Git hoặc mã frontend.
- Chống các rủi ro phổ biến như injection, XSS, CSRF tùy phương thức xác thực và cấu hình CORS phù hợp.
- Giới hạn tần suất cho các endpoint nhạy cảm như đăng nhập và quên mật khẩu.
- Ghi log có chọn lọc, không ghi mật khẩu, token hoặc nội dung riêng tư không cần thiết.
- Có quy trình xử lý lỗi an toàn, không trả stack trace cho người dùng ở môi trường production.

### 7.2. Quyền riêng tư
- Chỉ thu thập dữ liệu cần thiết.
- Công khai mục đích sử dụng dữ liệu.
- Người dùng có thể xem, xuất và yêu cầu xóa dữ liệu theo chính sách.
- Tách biệt dữ liệu theo tài khoản.
- Có cơ chế xóa lịch sử trò chuyện AI.
- Nếu dùng nhà cung cấp AI bên ngoài, cần thông báo rõ dữ liệu nào có thể được gửi đi.

### 7.3. Khả năng sử dụng
- Giao diện nhất quán, rõ ràng, dễ học.
- Responsive cho desktop, tablet và mobile.
- Có trạng thái tải, rỗng, thành công và lỗi.
- Biểu mẫu có thông báo lỗi dễ hiểu.
- Có xác nhận trước thao tác xóa hoặc hành động quan trọng.
- Hỗ trợ điều hướng bằng bàn phím ở các thành phần cơ bản.
- Màu sắc và độ tương phản đủ để đọc.

### 7.4. Hiệu năng và ổn định
- Phân trang danh sách lớn.
- Tối ưu truy vấn và chỉ mục cơ sở dữ liệu khi cần.
- Không tải toàn bộ dữ liệu nếu chỉ cần một phần.
- Hiển thị lỗi kết nối thân thiện.
- Có kiểm tra sức khỏe dịch vụ (`/health`) nếu kiến trúc backend hỗ trợ.

### 7.5. Tính đúng đắn của dữ liệu
- Có kiểm tra dữ liệu đầu vào.
- Các phép tính dashboard và báo cáo phải nhất quán.
- Lưu ngày giờ theo quy tắc rõ ràng và hiển thị theo múi giờ người dùng.
- Thao tác tạo/sửa/xóa phải cập nhật dữ liệu hiển thị.
- Tránh tạo giao dịch hoặc sự kiện trùng do gửi yêu cầu lặp khi có thể.

---

## 8. Công nghệ đề xuất

Có thể điều chỉnh nếu dự án đã có stack khác, nhưng phải sử dụng một kiến trúc thống nhất.

### Frontend
- ReactJS
- React Router
- Tailwind CSS
- Thư viện biểu đồ như Recharts hoặc tương đương
- Thư viện lịch phù hợp nếu cần
- Axios hoặc Fetch API để gọi backend

### Backend
- Node.js
- Express.js
- REST API có cấu trúc rõ ràng
- JWT hoặc cookie phiên bảo mật phù hợp
- Validation middleware
- Middleware xác thực và phân quyền

### Cơ sở dữ liệu
- MongoDB với Mongoose, hoặc cơ sở dữ liệu khác nếu đã được quyết định.
- Thiết kế schema/model rõ ràng cho người dùng, công việc, sự kiện, mục tiêu, thói quen, giao dịch, ngân sách, ghi chú, thông báo và lịch sử AI.

### Tích hợp AI
- Tạo lớp dịch vụ riêng cho AI để dễ thay nhà cung cấp.
- API key chỉ lưu ở backend qua biến môi trường.
- Có timeout, xử lý lỗi và giới hạn sử dụng.
- Nếu chưa có API key, hệ thống phải hiển thị rõ chế độ demo và không được tuyên bố AI thật đang hoạt động.

### Triển khai và kiểm thử
- Tệp `.env.example` chứa tên biến cần thiết nhưng không có secret thật.
- Có README hướng dẫn cài đặt và chạy.
- Có dữ liệu mẫu chỉ dùng cho môi trường demo/dev.
- Có kiểm thử các luồng chính.
- Nếu có Docker, cung cấp `Dockerfile` và `docker-compose.yml` cùng hướng dẫn chạy.

---

## 9. Gợi ý cấu trúc thư mục

```text
personal-life-management/
├── client/
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── components/
│       ├── layouts/
│       ├── pages/
│       │   ├── auth/
│       │   ├── dashboard/
│       │   ├── tasks/
│       │   ├── calendar/
│       │   ├── goals/
│       │   ├── habits/
│       │   ├── finance/
│       │   ├── notes/
│       │   ├── reports/
│       │   ├── assistant/
│       │   └── admin/
│       ├── services/
│       ├── hooks/
│       ├── context/
│       ├── utils/
│       └── App.jsx
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── validators/
│   │   ├── utils/
│   │   └── app.js
│   ├── tests/
│   └── server.js
├── .env.example
├── .gitignore
├── docker-compose.yml
└── README.md
```

Đây là cấu trúc tham khảo. AI Agent có thể điều chỉnh nhưng cần giữ mã nguồn có tổ chức, dễ bảo trì, tránh dồn toàn bộ ứng dụng vào một file.

---

## 10. Quy tắc thiết kế giao diện

- Phong cách hiện đại, tối giản, thân thiện và phù hợp cho quản lý cá nhân.
- Có sidebar hoặc thanh điều hướng rõ ràng cho các phân hệ chính.
- Có header với tiêu đề trang, thông báo và menu hồ sơ.
- Dashboard dùng thẻ thống kê, danh sách công việc sắp tới và biểu đồ có ý nghĩa.
- Mỗi trang có nội dung và chức năng riêng; không sao chép một dashboard cho tất cả URL.
- Dùng thành phần dùng chung cho nút, input, modal, bảng, bộ lọc và trạng thái.
- Có trạng thái loading, empty state, error state và success feedback.
- Các nút phải có hành động rõ ràng; không tạo nút trang trí không hoạt động.
- Biểu đồ phải lấy số liệu từ backend hoặc dữ liệu mẫu được đánh dấu rõ trong chế độ demo.
- Không dùng dữ liệu giả cố định để làm như chức năng backend đã hoàn thiện.

---

## 11. Yêu cầu API tối thiểu

Đặt tiền tố API nhất quán, ví dụ `/api`.

| Nhóm | Endpoint gợi ý | Mục đích |
|---|---|---|
| Auth | `POST /api/auth/register` | Đăng ký |
| Auth | `POST /api/auth/login` | Đăng nhập |
| Auth | `POST /api/auth/logout` | Đăng xuất |
| Auth | `GET /api/auth/me` | Lấy người dùng hiện tại |
| Profile | `GET /api/users/me` | Xem hồ sơ |
| Profile | `PATCH /api/users/me` | Cập nhật hồ sơ |
| Tasks | `GET/POST /api/tasks` | Danh sách/tạo công việc |
| Tasks | `GET/PATCH/DELETE /api/tasks/:id` | Chi tiết/sửa/xóa công việc |
| Events | `GET/POST /api/events` | Danh sách/tạo sự kiện |
| Events | `GET/PATCH/DELETE /api/events/:id` | Chi tiết/sửa/xóa sự kiện |
| Goals | `GET/POST /api/goals` | Danh sách/tạo mục tiêu |
| Habits | `GET/POST /api/habits` | Danh sách/tạo thói quen |
| Habit logs | `/api/habits/:id/logs` | Ghi nhận thực hiện thói quen |
| Transactions | `GET/POST /api/transactions` | Danh sách/tạo giao dịch |
| Transactions | `GET/PATCH/DELETE /api/transactions/:id` | Chi tiết/sửa/xóa giao dịch |
| Budgets | `GET/POST /api/budgets` | Xem/tạo ngân sách |
| Notes | `GET/POST /api/notes` | Danh sách/tạo ghi chú |
| Notes | `GET/PATCH/DELETE /api/notes/:id` | Chi tiết/sửa/xóa ghi chú |
| Notifications | `GET /api/notifications` | Danh sách thông báo |
| Notifications | `PATCH /api/notifications/:id/read` | Đánh dấu đã đọc |
| Reports | `GET /api/reports/summary` | Thống kê tổng quan |
| AI | `POST /api/assistant/chat` | Gửi câu hỏi cho AI |
| Admin | `/api/admin/users` | Quản lý tài khoản, chỉ admin |
| System | `GET /health` | Kiểm tra sức khỏe dịch vụ |

Đây là danh sách gợi ý. Mỗi endpoint cần có kiểm tra quyền, kiểm tra đầu vào, xử lý lỗi và định dạng phản hồi thống nhất. Có thể bổ sung endpoint theo thiết kế thực tế.

---

## 12. Tiêu chí nghiệm thu

Dự án chỉ được xem là hoàn thành khi đáp ứng các tiêu chí sau:

- [ ] Có đầy đủ mã nguồn frontend và backend theo kiến trúc đã chọn.
- [ ] Có kết nối cơ sở dữ liệu thật hoặc nêu rõ giới hạn của bản demo.
- [ ] Đăng ký, đăng nhập và đăng xuất hoạt động.
- [ ] Các trang được yêu cầu có route và điều hướng hoạt động.
- [ ] Công việc có thể thêm, xem, sửa, xóa và cập nhật trạng thái.
- [ ] Sự kiện có thể tạo, xem, sửa, xóa và hiển thị trên lịch.
- [ ] Mục tiêu và thói quen có thể quản lý và cập nhật tiến độ.
- [ ] Giao dịch thu/chi có thể thêm, xem, sửa, xóa và thống kê chính xác.
- [ ] Ngân sách được so sánh với dữ liệu chi tiêu thực.
- [ ] Ghi chú có thể thêm, tìm kiếm, sửa và xóa.
- [ ] Thông báo có thể xem và cập nhật trạng thái đọc.
- [ ] Dashboard và báo cáo thay đổi khi dữ liệu thay đổi.
- [ ] Tài khoản thường không thể truy cập dữ liệu của tài khoản khác.
- [ ] API quản trị được bảo vệ ở backend.
- [ ] AI Assistant hoạt động thật nếu đã cấu hình dịch vụ; nếu chưa, phải ghi rõ chế độ demo.
- [ ] Các thao tác xóa có xác nhận; các lỗi có thông báo phù hợp.
- [ ] Giao diện responsive và có trạng thái loading/rỗng/lỗi.
- [ ] Có `.env.example`, `.gitignore` và README hướng dẫn chạy.
- [ ] Không có API key, mật khẩu hoặc secret thật trong mã nguồn.
- [ ] Không còn nút chính hoặc liên kết điều hướng bị bỏ trống.

---

## 13. Hướng dẫn thực thi dành cho AI Agent

Hãy thực hiện dự án theo các giai đoạn dưới đây. Không dừng lại ở việc tạo giao diện minh họa.

### Giai đoạn 1 — Phân tích
1. Đọc toàn bộ tài liệu này.
2. Tóm tắt yêu cầu và lập danh sách chức năng.
3. Xác định các thực thể dữ liệu, quan hệ, quyền và luồng nghiệp vụ.
4. Nêu rõ các giả định kỹ thuật trước khi triển khai.

### Giai đoạn 2 — Thiết kế
1. Thiết kế sơ đồ kiến trúc.
2. Thiết kế schema/model và quy tắc phân quyền.
3. Thiết kế API và định dạng phản hồi/lỗi.
4. Thiết kế sitemap, layout và các thành phần dùng chung.
5. Đảm bảo mỗi trang tương ứng với chức năng cụ thể.

### Giai đoạn 3 — Xây dựng backend
1. Khởi tạo server và kết nối cơ sở dữ liệu.
2. Xây dựng xác thực, phân quyền và validation.
3. Xây dựng model, service, controller và route theo từng phân hệ.
4. Xây dựng xử lý lỗi tập trung và logging an toàn.
5. Kiểm thử API trước khi kết nối frontend.

### Giai đoạn 4 — Xây dựng frontend
1. Xây dựng layout, điều hướng và hệ thống component dùng chung.
2. Xây dựng các trang xác thực.
3. Xây dựng dashboard và từng phân hệ.
4. Kết nối từng trang với API thật.
5. Hoàn thiện trạng thái loading, empty, error và success.
6. Kiểm tra responsive.

### Giai đoạn 5 — AI Assistant
1. Tạo lớp service độc lập cho nhà cung cấp AI.
2. Kiểm tra quyền và giới hạn dữ liệu trước khi gọi AI.
3. Xử lý timeout, lỗi API và giới hạn sử dụng.
4. Yêu cầu xác nhận trước mọi thay đổi dữ liệu do AI đề xuất.
5. Phân biệt rõ chế độ AI thật và demo.

### Giai đoạn 6 — Kiểm thử và hoàn thiện
1. Kiểm tra toàn bộ luồng từ giao diện đến cơ sở dữ liệu.
2. Kiểm tra quyền truy cập và khả năng tách biệt dữ liệu.
3. Kiểm tra tính đúng đắn của số liệu báo cáo.
4. Sửa lỗi build, lỗi runtime và lỗi API.
5. Cập nhật README, `.env.example` và hướng dẫn chạy.
6. Báo cáo rõ những gì đã hoàn thành, những gì chưa hoàn thành và cách kiểm tra.

### Quy tắc bắt buộc khi làm việc
- Không chỉ trả về kế hoạch hoặc một trang HTML mẫu; hãy triển khai mã nguồn thực tế trong workspace nếu môi trường cho phép.
- Trước khi viết code, kiểm tra cấu trúc dự án hiện có để tránh ghi đè nhầm.
- Không xóa hoặc thay thế mã nguồn hiện tại khi chưa hiểu tác dụng của nó.
- Không tạo dữ liệu giả để đánh lừa rằng backend đã hoạt động.
- Không để các nút chức năng chính chỉ có giao diện mà không có hành động.
- Không bỏ qua xử lý lỗi, phân quyền hoặc bảo mật chỉ để hoàn thành nhanh.
- Sau mỗi giai đoạn, chạy build/test phù hợp và sửa lỗi phát sinh.
- Nếu thiếu thông tin hoặc API key, tiếp tục làm các phần độc lập và ghi rõ phần cần cấu hình; không tuyên bố chức năng chưa chạy là đã hoàn tất.
- Cuối cùng, cung cấp hướng dẫn cài đặt, lệnh chạy, tài khoản demo nếu có, các chức năng đã kiểm thử và các giới hạn còn lại.

---

## 14. Kết quả đầu ra mong muốn

AI Agent cần tạo ra:
1. Mã nguồn ứng dụng web đầy đủ.
2. Cơ sở dữ liệu/schema và dữ liệu khởi tạo phục vụ phát triển nếu cần.
3. Tài liệu API hoặc collection kiểm thử nếu phù hợp.
4. Tệp `.env.example`.
5. Tệp `README.md` hướng dẫn cài đặt và chạy.
6. Kiểm thử cho các luồng nghiệp vụ quan trọng.
7. Tài liệu tóm tắt kiến trúc, chức năng hoàn thành và giới hạn còn lại.

**Định nghĩa hoàn thành:** Đây là một hệ thống quản lý đời sống cá nhân đa trang, có xác thực, phân quyền, lưu trữ dữ liệu, CRUD hoạt động, báo cáo dựa trên dữ liệu thật và AI Assistant được tích hợp hoặc được ghi nhãn rõ là chế độ demo — không phải một trang giới thiệu tĩnh.
