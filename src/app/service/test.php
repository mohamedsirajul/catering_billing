<?php
require 'config_db.php';
$data = json_decode(file_get_contents('php://input'), true);
$type = $data['type'];
$uid = $data['uid'];
$company_id = $data['company_id'];
$mode = $data['mode'];
$startItem = $data['startItem'];
$endItem = 0;
$range_of_item = 15;
$last_item=0;
if ($type == '' || $uid == '') {
    $returnArr = array("ResponseCode" => "401", "Result" => "false", "ResponseMsg" => "Something Went wrong try again !");
} else if ($type >= 1) {

    $select_sales_record;
    $sale_ref_no;

    //get all invoice
    if ($mode == 0) {

        //to get the last id value
        if ($startItem == 0 && $type == 1) {
            $qry = $con->query("SELECT id FROM sales_record 
                                        where company_id = '$company_id' and action<>'3' 
                                        order by id desc limit 1");
            $qry = $qry->fetch_assoc();
            if (isset($qry['id'])) {
                $startItem = $qry['id'];
            }
        } else if ($startItem == 0 && $type != 1) {
            $qry = $con->query("SELECT id FROM sales_record 
                                where sales_record.emp_id = '$uid' and action<>'3' 
                                order by id desc limit 1");

            $qry = $qry->fetch_assoc();
            if (isset($qry['id'])) {
                $startItem = $qry['id'];
            }
        }

        //only for admins get invoice of theirs and sub user.
        if ($type == 1) {
            $select_sales_record = "SELECT *,sales_record.id as invoice_id FROM sales_record
                                        INNER JOIN app_users ON
                                        sales_record.emp_id = app_users.id
                                        where sales_record.company_id = '$company_id' and action<>'3' 
                                        and sales_record.id<=$startItem
                                        order by sales_record.id desc limit $range_of_item";
        }
        //only particular user invoices
        else {
            $select_sales_record = "SELECT *,sales_record.id as invoice_id FROM sales_record
                                    INNER JOIN app_users ON
                                                sales_record.emp_id = app_users.id
                                    where sales_record.emp_id = '$uid' and action<>'3' 
                                    and sales_record.id<=$startItem
                                    order by sales_record.id desc limit $range_of_item";
        }
    }
    //individual invoice(i.e used while refresh happens in invoice information)
    else if ($mode == 1) {
        $sale_ref_no = strip_tags(mysqli_real_escape_string($con, $data['sale_ref_no']));
        $select_sales_record = "SELECT *,sales_record.id as invoice_id FROM sales_record 
                                        INNER JOIN app_users ON
                                        sales_record.emp_id = app_users.id
                                        where sales_record.ref_no='$sale_ref_no'";
    }
    //Todo: customized invoice based on action and status of invoice
    else if ($mode == 2) {
        $isPaid = $data['isPaid'];
        $isPaymentPending = $data['isPaymentPending'];
        $isPartiallyPaid = $data['isPartiallyPaid'];
        $isCancel = $data['isCancel'];
        $isReturn = $data['isReturn'];

        //only for admins get invoice of theirs and sub user.
        if ($type == 1) {

            $endItem = $startItem - $range_of_item;
            $select_sales_record = "SELECT * FROM sales_record 
                                        INNER JOIN app_users ON
                                        sales_record.emp_id = app_users.id
                                        where sales_record.company_id = '$company_id' and sales_record.action<>'3' 
                                        and (sales_record.status='$isPaid' or sales_record.status='$isPaymentPending' or sales_record.status='$isPartiallyPaid' 
                                                or sales_record.action='$isCancel' or sales_record.action='$isReturn')
                                        order by sales_record.id desc";
        }
        //only particular user invoices
        // else {
        //     $endItem = $startItem - $range_of_item;
        //     $select_sales_record = "SELECT * FROM sales_record
        //                                 INNER JOIN app_users ON
        //                                 sales_record.emp_id = app_users.id
        //                                 where sales_record.emp_id = '$uid' and action<>'3'
        //                                 and sales_record.id BETWEEN $endItem AND $startItem
        //                                 order by sales_record.id desc";
        // }

    }
    // particular customer invoice based on name/id
    else if ($mode == 3) {
        $customer_id = strip_tags(mysqli_real_escape_string($con, $data['customer_id']));
        // $select_sales_record = "SELECT * FROM sales_record 
        //                                 INNER JOIN app_users ON
        //                                 sales_record.emp_id = app_users.id
        //                                 where sales_record.customer_id = '$customer_id' and action<>'3' 
        //                                 order by sales_record.id desc ";

        //to get the last id value
        if ($startItem == 0 && $type == 1) {
            $qry = $con->query("SELECT id FROM sales_record 
                                        where company_id = '$company_id' and action<>'3' 
                                        and customer_id = '$customer_id'
                                        order by id desc limit 1");
            $qry = $qry->fetch_assoc();
            if (isset($qry['id'])) {
                $startItem = $qry['id'];
            }
        } else if ($startItem == 0 && $type != 1) {
            $qry = $con->query("SELECT id FROM sales_record 
                                where sales_record.emp_id = '$uid' and action<>'3' 
                                and customer_id = '$customer_id'
                                order by id desc limit 1");

            $qry = $qry->fetch_assoc();
            if (isset($qry['id'])) {
                $startItem = $qry['id'];
            }
        }

        //only for admins get invoice of theirs and sub user.
        if ($type == 1) {
            $select_sales_record = "SELECT *,sales_record.id as invoice_id FROM sales_record
                                        INNER JOIN app_users ON
                                        sales_record.emp_id = app_users.id
                                        where sales_record.company_id = '$company_id' and action<>'3' 
                                        and sales_record.customer_id = '$customer_id' and sales_record.id<=$startItem
                                        order by sales_record.id desc limit $range_of_item";
        }
        //only particular user invoices
        else {
            $select_sales_record = "SELECT *,sales_record.id as invoice_id FROM sales_record
                                    INNER JOIN app_users ON
                                                sales_record.emp_id = app_users.id
                                    where sales_record.emp_id = '$uid' and action<>'3' 
                                    and sales_record.customer_id = '$customer_id and sales_record.id<=$startItem
                                    order by sales_record.id desc limit $range_of_item";
        }
    }
    //Get invoice between dates
    else if ($mode == 4) {
        $start_date = $data['start_date'];
        $end_date = $data['end_date'];

        //to get the last id value
        if ($startItem == 0 && $type == 1) {
            $qry = $con->query("SELECT id FROM sales_record 
                                where company_id = '$company_id' and action<>'3' 
                                and date_created BETWEEN '$start_date' AND '$end_date'
                                order by id desc limit 1 ");

            $qry = $qry->fetch_assoc();
            if (isset($qry['id'])) {
                $startItem = $qry['id'];
            }
        } else if ($startItem == 0 && $type != 1) {
            $qry = $con->query("SELECT id FROM sales_record 
                                where sales_record.emp_id = '$uid' and action<>'3'
                                and date_created BETWEEN '$start_date' AND '$end_date'
                                order by id desc limit 1");

            $qry = $qry->fetch_assoc();
            if (isset($qry['id'])) {
                $startItem = $qry['id'];
            }
        }

        //only for admins get invoice of theirs and sub user.
        if ($type == 1) {
            $select_sales_record = "SELECT *,sales_record.id as invoice_id FROM sales_record
                                        INNER JOIN app_users ON
                                        sales_record.emp_id = app_users.id
                                        where sales_record.company_id = '$company_id' and action<>'3' 
                                        and sales_record.id<=$startItem
                                        and sales_record.date_created BETWEEN '$start_date' AND '$end_date'
                                        order by sales_record.id desc limit $range_of_item";
        }
        //only particular user invoices
        else {
            $select_sales_record = "SELECT *,sales_record.id as invoice_id FROM sales_record
                                    INNER JOIN app_users ON
                                                sales_record.emp_id = app_users.id
                                    where sales_record.emp_id = '$uid' and action<>'3' 
                                    and sales_record.id<=$startItem
                                    and sales_record.date_created BETWEEN '$start_date' AND '$end_date'
                                    order by sales_record.id desc limit $range_of_item";
        }



        // //todo: date_created to invoice date
        // $select_sales_record = "SELECT * FROM sales_record 
        //                                 INNER JOIN app_users ON
        //                                 sales_record.emp_id = app_users.id
        //                                 where sales_record.company_id = '$company_id' and action<>'3' 
        //                                 and sales_record.date_created BETWEEN '$start_date' AND '$end_date' ";

    }
    //get all search
    else if ($mode == 5) {
        $search_value = $data['search_value'];

        // $select_sales_record = "SELECT *,sales_record.id as invoice_id,
        //                                 sales_record.previous_balance as s_previous_balance,
        //                                 sales_record.paid_amount as s_paid_amount,
        //                                 sales_record.status as s_status 
        //                                 FROM sales_record 
        //                                 INNER JOIN app_users ON
        //                                 sales_record.emp_id = app_users.id
        //                                 INNER JOIN customers on
        //                                 sales_record.customer_id=customers.id
        //                                 where sales_record.company_id = '$company_id' and sales_record.action<>'3' 
        //                                 and sales_record.ref_no like '%$search_value%' or customers.name like '%$search_value%' 
        //                                 order by sales_record.id desc";

        //to get the last id value ( get sales status for future use)
        if ($startItem == 0 && $type == 1) {
            $qry = $con->query("SELECT sales_record.id as invoice_id FROM sales_record
                                        INNER JOIN customers on
                                                    sales_record.customer_id=customers.id 
                                        where sales_record.company_id = '$company_id' and sales_record.action<>'3' 
                                        and (sales_record.ref_no like '%$search_value%' or customers.name like '%$search_value%' )
                                        order by sales_record.id desc limit 1");
            $qry = $qry->fetch_assoc();
            if (isset($qry['invoice_id'])) {
                $startItem = $qry['invoice_id'];
            }
        } else if ($startItem == 0 && $type != 1) {
            $qry = $con->query("SELECT sales_record.id as invoice_id FROM sales_record
                                         INNER JOIN customers on
                                                    sales_record.customer_id=customers.id 
                                        where sales_record.emp_id = '$uid' and sales_record.action<>'3'
                                        and (sales_record.ref_no like '%$search_value%' or customers.name like '%$search_value%') 
                                        order by sales_record.id desc limit 1");

            $qry = $qry->fetch_assoc();
            if (isset($qry['invoice_id'])) {
                $startItem = $qry['invoice_id'];
            }
        }

        //only for admins get invoice of theirs and sub user.
        if ($type == 1) {
            $select_sales_record = "SELECT *,sales_record.id as invoice_id,
                                            sales_record.previous_balance as s_previous_balance,
                                            sales_record.paid_amount as s_paid_amount,
                                            sales_record.status as s_status 
                                        FROM sales_record
                                        INNER JOIN app_users ON
                                                    sales_record.emp_id = app_users.id
                                        INNER JOIN customers on
                                                    sales_record.customer_id=customers.id
                                        where sales_record.company_id = '$company_id' and sales_record.action<>'3' 
                                        and sales_record.id<=$startItem
                                        and (sales_record.ref_no like '%$search_value%' or customers.name like '%$search_value%') 
                                        order by sales_record.id desc limit $range_of_item";
        }
        //only particular user invoices
        else {
            $select_sales_record = "SELECT *,sales_record.id as invoice_id, 
                                            sales_record.previous_balance as s_previous_balance,
                                            sales_record.paid_amount as s_paid_amount,
                                            sales_record.status as s_status 
                                    FROM sales_record
                                    INNER JOIN app_users ON
                                                sales_record.emp_id = app_users.id
                                    INNER JOIN customers on
                                                sales_record.customer_id=customers.id
                                    where sales_record.emp_id = '$uid' and sales_record.action<>'3' 
                                    and sales_record.id<=$startItem
                                    and (sales_record.ref_no like '%$search_value%' or customers.name like '%$search_value%') 
                                    order by sales_record.id desc limit $range_of_item";
        }

    } 
    //sort list of invoice
    else if ($mode == 6) {
        $order = $data['order'];
        $type_sort = $data['type_sort'];

        
        if ($type_sort == "Name") {
            $type_sort = "customers.name";
        } else {
            $type_sort = "sales_record.date_created";
        }

        
        //to get the last id value ( get sales status for future use)
        if ($startItem == 0 && $type == 1) {
            $qry = $con->query("SELECT sales_record.id as invoice_id FROM sales_record
                                        INNER JOIN customers on
                                                    sales_record.customer_id=customers.id 
                                        where sales_record.company_id = '$company_id' and sales_record.action<>'3' 
                                        order by $type_sort $order limit 1");
            $qry = $qry->fetch_assoc();
            if (isset($qry['invoice_id'])) {
                $startItem = $qry['invoice_id'];
                $last_item=$startItem;
            }
        } else if ($startItem == 0 && $type != 1) {
            $qry = $con->query("SELECT sales_record.id as invoice_id FROM sales_record
                                         INNER JOIN customers on
                                                    sales_record.customer_id=customers.id 
                                        where sales_record.emp_id = '$uid' and sales_record.action<>'3'
                                        order by $type_sort $order limit 1");

            $qry = $qry->fetch_assoc();
            if (isset($qry['invoice_id'])) {
                $startItem = $qry['invoice_id'];
                $last_item=$startItem;
            }
        }

        //this helps to start item with one
        if($startItem == 0 && $order == "asc"){
            $startItem=1;
        }

        //todo:Optimize this bug
        $orderString;
        if ($order == "asc") {
            // $orderString = "sales_record.id>=$startItem";
            $orderString = "row_number>=$startItem";

        } else {
            // $orderString = "sales_record.id<=$startItem";
            $orderString = "row_number<=$startItem";

        }

    

        //only for admins get invoice of theirs and sub user.
        if ($type == 1) {
            // $select_sales_record = "SELECT *,sales_record.id as invoice_id,
            //                                 sales_record.previous_balance as s_previous_balance,
            //                                 sales_record.paid_amount as s_paid_amount,
            //                                 sales_record.status as s_status 
            //                             FROM sales_record
            //                             INNER JOIN app_users ON
            //                                         sales_record.emp_id = app_users.id
            //                             INNER JOIN customers on
            //                                         sales_record.customer_id=customers.id
            //                             where sales_record.company_id = '$company_id' and sales_record.action<>'3' 
            //                             and $orderString
            //                             order by $type_sort $order limit $range_of_item";

            $select_sales_record = "SELECT *,ROW_NUMBER() OVER (ORDER BY sales_record.id) row_number,
                                            sales_record.id as invoice_id,
                                            sales_record.previous_balance as s_previous_balance,
                                            sales_record.paid_amount as s_paid_amount,
                                            sales_record.status as s_status 
                                        FROM sales_record
                                        INNER JOIN app_users ON
                                                    sales_record.emp_id = app_users.id
                                        INNER JOIN customers on
                                                    sales_record.customer_id=customers.id
                                    where sales_record.company_id = '$company_id' and sales_record.action<>'3' 
                                    and $orderString
                                    order by $type_sort $order limit $range_of_item";
        }
        //only particular user invoices
        else {
            $select_sales_record = "SELECT *,sales_record.id as invoice_id, 
                                            sales_record.previous_balance as s_previous_balance,
                                            sales_record.paid_amount as s_paid_amount,
                                            sales_record.status as s_status 
                                    FROM sales_record
                                    INNER JOIN app_users ON
                                                sales_record.emp_id = app_users.id
                                    INNER JOIN customers on
                                                sales_record.customer_id=customers.id
                                    where sales_record.emp_id = '$uid' and sales_record.action<>'3' 
                                    and $orderString
                                    order by $type_sort $order limit $range_of_item";
        }





        // //to get the last id value ( get sales status for future use)
        // if ($startItem == 0 && $type == 1) {
        //     $qry = $con->query("SELECT sales_record.id as invoice_id FROM sales_record
        //                                 INNER JOIN customers on
        //                                             sales_record.customer_id=customers.id 
        //                                 where sales_record.company_id = '$company_id' and sales_record.action<>'3' 
        //                                 order by sales_record.$type_sort $order limit 1");
        //     $qry = $qry->fetch_assoc();
        //     if (isset($qry['invoice_id'])) {
        //         $startItem = $qry['invoice_id'];
        //     }
        // } 
        // else if ($startItem == 0 && $type != 1) {
        //     $qry = $con->query("SELECT sales_record.id as invoice_id FROM sales_record
        //                                  INNER JOIN customers on
        //                                             sales_record.customer_id=customers.id 
        //                                 where sales_record.emp_id = '$uid' and sales_record.action<>'3'
        //                                 order by sales_record.$type_sort $order limit 1");

        //     $qry = $qry->fetch_assoc();
        //     if (isset($qry['invoice_id'])) {
        //         $startItem = $qry['invoice_id'];
        //     }
        // }

        // //only for admins get invoice of theirs and sub user.
        // if ($type == 1) {
        //     $select_sales_record = "SELECT *,sales_record.id as invoice_id
        //                                 FROM sales_record
        //                                 INNER JOIN app_users ON
        //                                             sales_record.emp_id = app_users.id
        //                                 where sales_record.company_id = '$company_id' and sales_record.action<>'3' 
        //                                 and sales_record.id<=$startItem
        //                                 order by sales_record.$type_sort $order limit $range_of_item";
        // }
        // //only particular user invoices
        // else {
        //     $select_sales_record = "SELECT *,sales_record.id as invoice_id, 
        //                             FROM sales_record
        //                             INNER JOIN app_users ON
        //                                         sales_record.emp_id = app_users.id
        //                             where sales_record.emp_id = '$uid' and sales_record.action<>'3' 
        //                             and sales_record.id<=$startItem
        //                             order by sales_record.$type_sort $order limit $range_of_item";
        // }

    }


    $make_conection_sale_record = $con->query($select_sales_record);
    $sale_data = array();
    $all_sale = array();

    //loop through each sale of the user made
    while ($sales_row = $make_conection_sale_record->fetch_assoc()) {
        $product_data = array();
        $all_product = array();

        $customer_id = $sales_row['customer_id'];
        $form_id = $sales_row['ref_no'];
        $empid = $sales_row['emp_id'];

        $subTotal = 0;
        $grandTotal = 0;

        $make_connection_inventory = $con->query("SELECT * FROM inventory where type = '2' and company_id = '$company_id'
                                                            and form_id = '$form_id' and status='1'");

        //loop through inventory to find the product in current sales
        while ($inventory_row = $make_connection_inventory->fetch_assoc()) {

            //this will get the current product sale price and its quantity
            foreach (json_decode($inventory_row['other_details']) as $key => $value) {
                $inventory_row[$key] = $value;
            }

            $proid = $inventory_row['product_id'];

            //get desire product
            $make_connection_product = $con->query("SELECT * FROM products where id = '$proid'");
            $product_column = $make_connection_product->fetch_assoc();

            $product_data['id'] = $proid;
            $product_data['name'] = $product_column['product_name'];
            $product_data['code'] = $product_column['product_code'];
            $product_data['gst'] = $product_column['product_gst'];

            //current product price and qty during sale
            $qty = $inventory_row['qty'];
            $price = $inventory_row['price'];

            $total = $qty * $price;
            $product_data['total'] = $total;
            $product_data['qty'] = $qty;
            $product_data['sale_price'] = $price;
            $all_product[] = $product_data;

            $subTotal += $total;
            $grandTotal += $total + ($total * (int) $product_data['gst'] / 100);

        }

        //get current customer details
        $make_connection_customer = $con->query("SELECT * FROM customers where id = '$customer_id'");
        $customer_column = $make_connection_customer->fetch_assoc();

        $endItem = $sales_row['invoice_id'];
        $sale_data['id'] = $sales_row['invoice_id'];
        $sale_data['invoice'] = $sales_row['ref_no'];
        // $sale_data['biller'] = $shop2;

        $sale_data['cus_id'] = $sales_row['customer_id'];
        $sale_data['cus_name'] = $customer_column['name'];
        $sale_data['cus_mobile'] = $customer_column['mobile'];
        $sale_data['cus_address'] = $customer_column['address'];

        $sale_data['sub_total'] = $sales_row['net_amount'];
        $sale_data['grand_total'] = $sales_row['total_amount'];
        $sale_data['bill_amount'] = $sales_row['rounded_amount'];
        $sale_data['given_amount'] = $sales_row['given_amount'];

        if ($mode == 5 || $mode == 6) { //get status in future
            $sale_data['previous_balance'] = $sales_row['s_previous_balance'];
            $sale_data['paid_amount'] = $sales_row['s_paid_amount'];
        } else {
            $sale_data['previous_balance'] = $sales_row['previous_balance'];
            $sale_data['paid_amount'] = $sales_row['paid_amount'];
        }
        $sale_data['receipt_amount'] = $sales_row['receipt_amount'];
        $sale_data['balance_amount'] = $sales_row['balance_amount'];
        $sale_data['is_write_off'] = $sales_row['is_write_off'];
        $sale_data['action'] = $sales_row['action'];

        $sale_data['products'] = $all_product;

        $sale_data['created_by'] = $sales_row['name'];
        $sale_data['notes'] = $sales_row['notes'];
        $sale_data['terms_and_conditions'] = $sales_row['terms_and_conditions'];

        $sale_data['date'] = date("d-m-Y", strtotime($sales_row['date_created']));
        $sale_data['updated_date'] = date("d-m-Y", strtotime($sales_row['date_updated']));
        $all_sale[] = $sale_data;

        // $sale_data['sub_total']=number_format((float)$subTotal, 2, '.', '');
        // $p['grand_total']=number_format((float)$grandTotal, 2, '.', '');

    }

    //this indicates the end of invoice in the list
    if (sizeof($all_sale) < $range_of_item) {
        $endItem = 0;
    }

    if($mode==6 && $data['order']=="asc"){
        $endItem =$endItem +1;
    }else{
        $$endItem = $endItem - 1;
    }
    $returnArr = array("ResponseCode" => "200", "Result" => "true", "ResponseMsg" => "Success", "data" => $all_sale, "end_item" => $endItem,"last_item"=>$last_item);
}
echo json_encode($returnArr);
mysqli_close($con);
?>